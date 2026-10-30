"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { auth } from "@/lib/db/auth";
import { db } from "@/lib/db";
import { services } from "@/lib/db/app-schema";

const serviceSchema = z.object({
  name: z.string().trim().min(2, "Service name must contain at least 2 characters.").max(100),
  description: z.string().trim().max(1000).optional(),
  durationMinutes: z.coerce.number().int().min(5).max(1440),
  priceNaira: z.coerce.number().finite().min(0).max(100000000),
});

const serviceIdSchema = z.string().trim().min(1).max(100);

export type ServiceActionState = {
  error?: string;
  success?: boolean;
};

async function requireOwner() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/sign-in");

  return session.user.id;
}

function parseServiceForm(formData: FormData) {
  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || "",
    durationMinutes: formData.get("durationMinutes"),
    priceNaira: formData.get("priceNaira"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || "Please check the service details.",
    };
  }

  const priceKobo = Math.round(parsed.data.priceNaira * 100);

  if (!Number.isSafeInteger(priceKobo)) {
    return { error: "Please enter a valid service price." };
  }

  return {
    data: {
      name: parsed.data.name,
      description: parsed.data.description?.trim() || null,
      durationMinutes: parsed.data.durationMinutes,
      priceKobo,
    },
  };
}

function revalidateServicePages() {
  revalidatePath("/services");
  revalidatePath("/bookings");
  revalidatePath("/");
}

export async function createService(
  _previousState: ServiceActionState,
  formData: FormData,
): Promise<ServiceActionState> {
  const ownerId = await requireOwner();
  const parsed = parseServiceForm(formData);

  if ("error" in parsed) return { error: parsed.error };

  try {
    await db.insert(services).values({
      id: randomUUID(),
      ownerId,
      ...parsed.data,
      isActive: true,
    });
  } catch (error) {
    console.error("Failed to create service:", error);
    return { error: "We couldn't save this service. Please try again." };
  }

  revalidateServicePages();
  return { success: true };
}

export async function updateService(
  _previousState: ServiceActionState,
  formData: FormData,
): Promise<ServiceActionState> {
  const ownerId = await requireOwner();
  const idResult = serviceIdSchema.safeParse(formData.get("serviceId"));

  if (!idResult.success) return { error: "Invalid service." };

  const parsed = parseServiceForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  try {
    const updated = await db
      .update(services)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(and(eq(services.id, idResult.data), eq(services.ownerId, ownerId)))
      .returning({ id: services.id });

    if (updated.length === 0) {
      return { error: "Service not found." };
    }
  } catch (error) {
    console.error("Failed to update service:", error);
    return { error: "We couldn't update this service. Please try again." };
  }

  revalidateServicePages();
  return { success: true };
}

export async function toggleServiceActive(
  serviceId: string,
): Promise<ServiceActionState> {
  const ownerId = await requireOwner();
  const idResult = serviceIdSchema.safeParse(serviceId);

  if (!idResult.success) return { error: "Invalid service." };

  try {
    const result = await db
      .update(services)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(services.id, idResult.data),
          eq(services.ownerId, ownerId),
          eq(services.isActive, true),
        ),
      )
      .returning({ id: services.id });

    if (result.length === 0) {
      const reactivated = await db
        .update(services)
        .set({
          isActive: true,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(services.id, idResult.data),
            eq(services.ownerId, ownerId),
            eq(services.isActive, false),
          ),
        )
        .returning({ id: services.id });

      if (reactivated.length === 0) {
        return { error: "Service not found." };
      }
    }
  } catch (error) {
    console.error("Failed to change service status:", error);
    return { error: "We couldn't change this service's status. Please try again." };
  }

  revalidateServicePages();
  return { success: true };
}