
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { businessProfiles } from "./app-schema";

export type BusinessProfile = typeof businessProfiles.$inferSelect;

export type CreateBusinessProfileInput = {
  ownerId: string;
  brandName: string;
  slogan?: string | null;
  websiteTitle: string | null;
  description?: string | null;
  logoUrl?: string | null;
};

export type UpdateBusinessProfileInput = {
  brandName: string;
  slogan?: string | null;
  websiteTitle: string | null;
  description?: string | null;
  logoUrl?: string | null;
};

export async function getBusinessProfile(ownerId: string) {
  const [profile] = await db
    .select()
    .from(businessProfiles)
    .where(eq(businessProfiles.ownerId, ownerId))
    .limit(1);

  return profile ?? null;
}

export async function createBusinessProfile(
  input: CreateBusinessProfileInput,
) {
  const [profile] = await db
    .insert(businessProfiles)
    .values({
      id: crypto.randomUUID(),
      ownerId: input.ownerId,
      brandName: input.brandName,
      slogan: input.slogan || null,
      websiteTitle: input.websiteTitle,
      description: input.description || null,
      logoUrl: input.logoUrl || null,
    })
    .returning();

  return profile;
}

export async function updateBusinessProfile(
  ownerId: string,
  input: UpdateBusinessProfileInput,
) {
  const [profile] = await db
    .update(businessProfiles)
    .set({
      brandName: input.brandName,
      slogan: input.slogan || null,
      websiteTitle: input.websiteTitle,
      description: input.description || null,
      logoUrl: input.logoUrl || null,
      updatedAt: new Date(),
    })
    .where(eq(businessProfiles.ownerId, ownerId))
    .returning();

  return profile ?? null;
}
