
"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
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

export type ServiceActionState = {
  error?: string;
  success?: boolean;
};

export async function createService(
  _previousState: ServiceActionState,
  formData: FormData,
): Promise<ServiceActionState> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

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

  try {
    await db.insert(services).values({
      id: randomUUID(),
      ownerId: session.user.id,
      name: parsed.data.name,
      description: parsed.data.description?.trim() || null,
      durationMinutes: parsed.data.durationMinutes,
      priceKobo,
      isActive: true,
    });
  } catch (error) {
    console.error("Failed to create service:", error);
    return {
      error: "We couldn't save this service. Please try again.",
    };
  }

  revalidatePath("/services");
  revalidatePath("/");

  return { success: true };
}
