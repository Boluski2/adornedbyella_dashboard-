
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import pg from "pg";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { bookings, clients, services } from "@/lib/db/app-schema";
import { bookingConflictCondition } from "@/lib/bookings/conflicts";

const testDatabaseURL = process.env.DATABASE_URL_TEST;
const mainDatabaseURL = process.env.DATABASE_URL_MAIN_FOR_TEST;

if (
  !testDatabaseURL ||
  process.env.DATABASE_URL !== testDatabaseURL ||
  testDatabaseURL === mainDatabaseURL
) {
  throw new Error("Booking tests must use the isolated test database.");
}

const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const ownerId = `booking-test-owner-${suffix}`;
const otherOwnerId = `booking-test-other-${suffix}`;
const clientId = `booking-test-client-${suffix}`;
const otherClientId = `booking-test-other-client-${suffix}`;
const serviceId = `booking-test-service-${suffix}`;
const otherServiceId = `booking-test-other-service-${suffix}`;

const start = new Date("2035-06-15T10:00:00.000Z");
const end = new Date("2035-06-15T11:00:00.000Z");

async function createUser(client: pg.Client, id: string, email: string) {
  await client.query(
    `INSERT INTO "user" (id, name, email, email_verified, created_at, updated_at)
     VALUES ($1, $2, $3, false, NOW(), NOW())`,
    [id, "Booking Integration Test", email],
  );
}

describe("Booking conflict condition integration", () => {
  let client: pg.Client;

  beforeAll(async () => {
    client = new pg.Client({ connectionString: testDatabaseURL });
    await client.connect();

    await createUser(
      client,
      ownerId,
      `booking-owner-${suffix}@example.com`,
    );
    await createUser(
      client,
      otherOwnerId,
      `booking-other-owner-${suffix}@example.com`,
    );

    await db.insert(clients).values([
      {
        id: clientId,
        ownerId,
        name: "Booking Test Client",
      },
      {
        id: otherClientId,
        ownerId: otherOwnerId,
        name: "Other Booking Test Client",
      },
    ]);

    await db.insert(services).values([
      {
        id: serviceId,
        ownerId,
        name: "Booking Test Service",
        durationMinutes: 60,
        priceKobo: 500000,
      },
      {
        id: otherServiceId,
        ownerId: otherOwnerId,
        name: "Other Booking Test Service",
        durationMinutes: 60,
        priceKobo: 500000,
      },
    ]);
  });


  afterAll(async () => {
    try {
      await client.query(
        `DELETE FROM bookings
         WHERE owner_id = ANY($1::text[])`,
        [[ownerId, otherOwnerId]],
      );

      await client.query(
        `DELETE FROM clients
         WHERE id = ANY($1::text[])`,
        [[clientId, otherClientId]],
      );

      await client.query(
        `DELETE FROM services
         WHERE id = ANY($1::text[])`,
        [[serviceId, otherServiceId]],
      );

      await client.query(
        `DELETE FROM "user"
         WHERE id = ANY($1::text[])`,
        [[ownerId, otherOwnerId]],
      );
    } finally {
      await client.end().catch(() => {});
    }
  });


  it("detects overlapping appointments for the same owner", async () => {
    await db.insert(bookings).values({
      id: `booking-test-overlap-${suffix}`,
      ownerId,
      clientId,
      serviceId,
      startsAt: start,
      endsAt: end,
      priceKobo: 500000,
      status: "scheduled",
    });

    const conflicts = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        bookingConflictCondition(
          ownerId,
          new Date("2035-06-15T10:30:00.000Z"),
          new Date("2035-06-15T11:30:00.000Z"),
        ),
      );

    expect(conflicts.length).toBeGreaterThan(0);
  });

  it("allows back-to-back appointments", async () => {
    const conflicts = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        bookingConflictCondition(
          ownerId,
          end,
          new Date("2035-06-15T12:00:00.000Z"),
        ),
      );

    expect(conflicts).toHaveLength(0);
  });

  it("ignores cancelled appointments", async () => {
    await db
      .update(bookings)
      .set({ status: "cancelled" })
      .where(eq(bookings.id, `booking-test-overlap-${suffix}`));

    const conflicts = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        bookingConflictCondition(
          ownerId,
          new Date("2035-06-15T10:30:00.000Z"),
          new Date("2035-06-15T11:30:00.000Z"),
        ),
      );

    expect(conflicts).toHaveLength(0);
  });

  it("does not report another owner's appointment as a conflict", async () => {
    await db.insert(bookings).values({
      id: `booking-test-other-${suffix}`,
      ownerId: otherOwnerId,
      clientId: otherClientId,
      serviceId: otherServiceId,
      startsAt: start,
      endsAt: end,
      priceKobo: 500000,
      status: "scheduled",
    });

    const conflicts = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        bookingConflictCondition(
          ownerId,
          new Date("2035-06-15T10:30:00.000Z"),
          new Date("2035-06-15T11:30:00.000Z"),
        ),
      );

    expect(conflicts).toHaveLength(0);
  });
});
