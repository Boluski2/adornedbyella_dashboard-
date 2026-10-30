
"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import {
  canTransitionBookingStatus,
  type BookingStatus,
} from "@/lib/bookings/status";

import { auth } from "@/lib/db/auth";
import { db } from "@/lib/db";
import { bookings, clients, services } from "@/lib/db/app-schema";
import { bookingConflictCondition } from "@/lib/bookings/conflicts";
import { NeonDbError } from "@neondatabase/serverless";

export type BookingActionState = {
  error?: string;
  success?: boolean;
};

const bookingSchema = z.object({
  clientId: z.string().trim().min(1, "Please select a client."),
  serviceId: z.string().trim().min(1, "Please select a service."),
  startsAt: z.iso.datetime({ offset: true }),
  notes: z.string().trim().max(2000).optional(),
});

export async function createBooking(
  _previousState: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const parsed = bookingSchema.safeParse({
    clientId: formData.get("clientId"),
    serviceId: formData.get("serviceId"),
    startsAt: formData.get("startsAt"),
    notes: formData.get("notes") || "",
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || "Please check the booking details.",
    };
  }

  const startsAt = new Date(parsed.data.startsAt);

  if (Number.isNaN(startsAt.getTime())) {
    return { error: "Please select a valid appointment date and time." };
  }

  try {
    const [client] = await db
      .select({ id: clients.id })
      .from(clients)
      .where(
        and(
          eq(clients.id, parsed.data.clientId),
          eq(clients.ownerId, session.user.id),
        ),
      )
      .limit(1);

    if (!client) {
      return { error: "The selected client could not be found." };
    }

    const [service] = await db
      .select({
        id: services.id,
        durationMinutes: services.durationMinutes,
        priceKobo: services.priceKobo,
        isActive: services.isActive,
      })
      .from(services)
      .where(
        and(
          eq(services.id, parsed.data.serviceId),
          eq(services.ownerId, session.user.id),
        ),
      )
      .limit(1);

    if (!service) {
      return { error: "The selected service could not be found." };
    }

    if (!service.isActive) {
      return { error: "This service is inactive and cannot be booked." };
    }

    const endsAt = new Date(
      startsAt.getTime() + service.durationMinutes * 60_000,
    );

    const [conflictingBooking] = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        bookingConflictCondition(
          session.user.id,
          startsAt,
          endsAt,
        ),
      )
      .limit(1);

    if (conflictingBooking) {
      return {
        error: "This time overlaps another booking. Choose a different time.",
      };
    }

    await db.insert(bookings).values({
      id: randomUUID(),
      ownerId: session.user.id,
      clientId: client.id,
      serviceId: service.id,
      startsAt,
      endsAt,
      priceKobo: service.priceKobo,
      status: "scheduled",
      notes: parsed.data.notes?.trim() || null,
    });
   } catch (error) {
    if (
      error instanceof NeonDbError &&
      error.code === "23P01" &&
      error.constraint === "bookings_no_active_overlap"
    ) {
      return {
        error: "This time overlaps another booking. Choose a different time.",
      };
    }

    console.error("Failed to create booking:", error);
    return {
      error: "We couldn't save this booking. Please try again.",
    };
  }


  revalidatePath("/bookings");
  revalidatePath("/clients");
  revalidatePath("/");

  return { success: true };
}



export async function cancelBooking(
  bookingId: string,
): Promise<BookingActionState> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  if (
    typeof bookingId !== "string" ||
    bookingId.trim().length === 0 ||
    bookingId.length > 100
  ) {
    return { error: "Invalid booking." };
  }

  try {
    const updated = await db
      .update(bookings)
      .set({ status: "cancelled" })
      .where(
        and(
          eq(bookings.id, bookingId),
          eq(bookings.ownerId, session.user.id),
          ne(bookings.status, "cancelled"),
          ne(bookings.status, "completed"),
        ),
      )
      .returning({ id: bookings.id });

    if (updated.length === 0) {
      return {
        error:
          "Booking not found, or it has already been cancelled or completed.",
      };
    }
  } catch (error) {
    console.error("Failed to cancel booking:", error);
    return {
      error: "We couldn't cancel this booking. Please try again.",
    };
  }

  revalidatePath("/bookings");
  revalidatePath("/clients");
  revalidatePath("/");

  return { success: true };
}



const bookingStatusSchema = z.enum([
  "confirmed",
  "completed",
  "no_show",
]);



export async function updateBookingStatus(
  bookingId: string,
  status: "confirmed" | "completed" | "no_show",
): Promise<BookingActionState> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  if (
    typeof bookingId !== "string" ||
    bookingId.trim().length === 0 ||
    bookingId.length > 100
  ) {
    return { error: "Invalid booking." };
  }

  const parsedStatus = bookingStatusSchema.safeParse(status);

  if (!parsedStatus.success) {
    return { error: "Please select a valid booking status." };
  }

  try {
    const [existingBooking] = await db
      .select({
        id: bookings.id,
        status: bookings.status,
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.id, bookingId),
          eq(bookings.ownerId, session.user.id),
        ),
      )
      .limit(1);

    if (!existingBooking) {
      return { error: "Booking not found." };
    }


            const currentStatus = existingBooking.status as BookingStatus;

            if (
            !canTransitionBookingStatus(
                currentStatus,
                parsedStatus.data,
            )
            ) {
            return {
                error: `A booking cannot be changed from "${currentStatus.replace("_", " ")}" to "${parsedStatus.data.replace("_", " ")}".`,
            };
            }


    const updated = await db
      .update(bookings)
      .set({ status: parsedStatus.data })
      .where(
        and(
          eq(bookings.id, bookingId),
          eq(bookings.ownerId, session.user.id),
          eq(bookings.status, existingBooking.status),
        ),
      )
      .returning({ id: bookings.id });

    if (updated.length === 0) {
      return {
        error:
          "The booking changed before your update could be saved. Refresh and try again.",
      };
    }
  } catch (error) {
    console.error("Failed to update booking status:", error);
    return {
      error: "We couldn't update this booking. Please try again.",
    };
  }

  revalidatePath("/bookings");
  revalidatePath("/clients");
  revalidatePath("/");

  return { success: true };
}
