
"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import { auth } from "@/lib/db/auth";
import { db } from "@/lib/db";
import { bookings, clients } from "@/lib/db/app-schema";
import { and, eq } from "drizzle-orm";

const clientSchema = z.object({
  name: z.string().trim().min(2, "Name must contain at least 2 characters.").max(100),
  email: z.union([z.email(), z.literal("")]).optional(),
  phone: z.string().trim().max(30).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export type CreateClientState = {
  error?: string;
  success?: boolean;
};

export async function createClient(
  _previousState: CreateClientState,
  formData: FormData,
): Promise<CreateClientState> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const parsed = clientSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email") || "",
    phone: formData.get("phone") || "",
    notes: formData.get("notes") || "",
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || "Please check your details.",
    };
  }

  const email = parsed.data.email?.trim() || null;
  const phone = parsed.data.phone?.trim() || null;
  const notes = parsed.data.notes?.trim() || null;

  try {
    await db.insert(clients).values({
      id: randomUUID(),
      ownerId: session.user.id,
      name: parsed.data.name,
      email,
      phone,
      notes,
    });
  } catch (error) {
    console.error("Failed to create client:", error);

    return {
      error: "We couldn't save this client. Please try again.",
    };
  }

  revalidatePath("/clients");

  return { success: true };
}



export async function updateClient(
  clientId: string,
  _previousState: CreateClientState,
  formData: FormData,
): Promise<CreateClientState> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  if (
    typeof clientId !== "string" ||
    clientId.trim().length === 0 ||
    clientId.length > 100
  ) {
    return { error: "Invalid client." };
  }

  const parsed = clientSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email") || "",
    phone: formData.get("phone") || "",
    notes: formData.get("notes") || "",
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || "Please check your details.",
    };
  }

  try {
    const updated = await db
      .update(clients)
      .set({
        name: parsed.data.name,
        email: parsed.data.email?.trim() || null,
        phone: parsed.data.phone?.trim() || null,
        notes: parsed.data.notes?.trim() || null,
        updatedAt: new Date(),
      })
        .where(
        and(
            eq(clients.id, clientId),
            eq(clients.ownerId, session.user.id),
        ),
        )
      .returning({ id: clients.id });

    if (updated.length === 0) {
      return {
        error: "Client not found.",
      };
    }
  } catch (error) {
    console.error("Failed to update client:", error);

    return {
      error: "We couldn't update this client. Please try again.",
    };
  }

  revalidatePath("/clients");

  return { success: true };
}


export async function deleteClient(
  clientId: string,
): Promise<CreateClientState> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  if (
    typeof clientId !== "string" ||
    clientId.trim().length === 0 ||
    clientId.length > 100
  ) {
    return { error: "Invalid client." };
  }

  try {
    const existingBookings = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        and(
          eq(bookings.clientId, clientId),
          eq(bookings.ownerId, session.user.id),
        ),
      )
      .limit(1);

    if (existingBookings.length > 0) {
      return {
        error:
          "This client has bookings. Cancel or remove their bookings before deleting this client.",
      };
    }

    const deleted = await db
      .delete(clients)
      .where(
        and(
          eq(clients.id, clientId),
          eq(clients.ownerId, session.user.id),
        ),
      )
      .returning({ id: clients.id });

    if (deleted.length === 0) {
      return { error: "Client not found." };
    }
  } catch (error) {
    console.error("Failed to delete client:", error);
    return {
      error:
        "We couldn't delete this client. They may have related bookings.",
    };
  }

  revalidatePath("/clients");
  return { success: true };
}