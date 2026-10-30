
"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/lib/db/auth";
import {
  createBusinessProfile,
  getBusinessProfile,
  updateBusinessProfile,
} from "@/lib/db/business-profiles";

const businessProfileSchema = z.object({
  brandName: z
    .string()
    .trim()
    .min(2, "Brand name must contain at least 2 characters.")
    .max(100, "Brand name must not exceed 100 characters."),
  slogan: z
    .string()
    .trim()
    .max(160, "Slogan must not exceed 160 characters.")
    .optional(),
  websiteTitle: z
    .string()
    .trim()
    .max(100, "Website title must not exceed 100 characters.")
    .optional(),
  description: z
    .string()
    .trim()
    .max(1000, "Description must not exceed 1000 characters.")
    .optional(),
});

export type BusinessProfileState = {
  error?: string;
  success?: boolean;
};

async function getAuthenticatedUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return session.user;
}

function parseBusinessProfile(formData: FormData) {
  return businessProfileSchema.safeParse({
    brandName: formData.get("brandName"),
    slogan: formData.get("slogan") || "",
    websiteTitle: formData.get("websiteTitle"),
    description: formData.get("description") || "",
  });
}

export async function createBusinessProfileAction(
  _previousState: BusinessProfileState,
  formData: FormData,
): Promise<BusinessProfileState> {
  const user = await getAuthenticatedUser();

  const parsed = parseBusinessProfile(formData);

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || "Please check your details.",
    };
  }

  try {
    const existingProfile = await getBusinessProfile(user.id);

    if (existingProfile) {
      return {
        error: "Your business profile already exists. Please edit it instead.",
      };
    }

    await createBusinessProfile({
      ownerId: user.id,
      brandName: parsed.data.brandName,
      slogan: parsed.data.slogan || null,
      websiteTitle: parsed.data.websiteTitle || null,
      description: parsed.data.description || null,
    });
  } catch (error) {
    console.error("Failed to create business profile:", error);

    return {
      error: "We couldn't save your business profile. Please try again.",
    };
  }

  revalidatePath("/");
  revalidatePath("/profile");

  redirect("/");
}

export async function updateBusinessProfileAction(
  _previousState: BusinessProfileState,
  formData: FormData,
): Promise<BusinessProfileState> {
  const user = await getAuthenticatedUser();

  const parsed = parseBusinessProfile(formData);

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || "Please check your details.",
    };
  }

  try {
    const existingProfile = await getBusinessProfile(user.id);

    if (!existingProfile) {
      return {
        error: "Business profile not found. Please complete setup first.",
      };
    }

    await updateBusinessProfile(user.id, {
      brandName: parsed.data.brandName,
      slogan: parsed.data.slogan || null,
      websiteTitle: parsed.data.websiteTitle || null,
      description: parsed.data.description || null,
      logoUrl: existingProfile.logoUrl,
    });
  } catch (error) {
    console.error("Failed to update business profile:", error);

    return {
      error: "We couldn't update your business profile. Please try again.",
    };
  }

  revalidatePath("/");
  revalidatePath("/profile");

  return { success: true };
}
