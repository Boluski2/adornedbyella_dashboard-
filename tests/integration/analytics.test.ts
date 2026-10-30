import { afterAll, beforeAll, describe, expect, it } from "vitest";
import pg from "pg";
import { db } from "@/lib/db";
import { bookings, clients, services } from "@/lib/db/app-schema";
import {
  getMonthlyRevenue,
  getMonthlyBookingStats,
  getServicePerformance,
  getClientInsights,
} from "@/lib/db/analytics";

const testDatabaseURL = process.env.DATABASE_URL_TEST;
const mainDatabaseURL = process.env.DATABASE_URL_MAIN_FOR_TEST;

if (
  !testDatabaseURL ||
  process.env.DATABASE_URL !== testDatabaseURL ||
  testDatabaseURL === mainDatabaseURL
) {
  throw new Error("Analytics tests must use the isolated test database.");
}

const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const ownerId = `analytics-owner-${suffix}`;
const otherOwnerId = `analytics-other-owner-${suffix}`;

const clientAId = `analytics-client-a-${suffix}`;
const clientBId = `analytics-client-b-${suffix}`;
const otherClientId = `analytics-other-client-${suffix}`;

const serviceAId = `analytics-service-a-${suffix}`;
const serviceBId = `analytics-service-b-${suffix}`;
const zeroServiceId = `analytics-service-zero-${suffix}`;
const otherServiceId = `analytics-other-service-${suffix}`;

const bookingIds = Array.from(
  { length: 6 },
  (_, index) => `analytics-booking-${index}-${suffix}`,
);

let sqlClient: pg.Client;

function getCurrentLagosDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
  };
}

function getMonthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

describe("Analytics integration tests", () => {
  beforeAll(async () => {
    sqlClient = new pg.Client({
      connectionString: testDatabaseURL,
    });

    await sqlClient.connect();

    const now = new Date();
    const current = getCurrentLagosDate();

    const currentMonth = getMonthKey(current.year, current.month);

    const previousMonthDate = new Date(
      Date.UTC(current.year, current.month - 2, 1),
    );

    const previousMonth = getMonthKey(
      previousMonthDate.getUTCFullYear(),
      previousMonthDate.getUTCMonth() + 1,
    );

    const currentMonthStart = new Date(
      `${currentMonth}-01T00:00:00+01:00`,
    );

    const previousMonthStart = new Date(
      `${previousMonth}-01T00:00:00+01:00`,
    );

    await sqlClient.query(
      `
        INSERT INTO "user"
          (id, name, email, email_verified, created_at, updated_at)
        VALUES
          ($1, $2, $3, false, NOW(), NOW()),
          ($4, $5, $6, false, NOW(), NOW())
      `,
      [
        ownerId,
        "Analytics Test Owner",
        `analytics-owner-${suffix}@example.com`,
        otherOwnerId,
        "Analytics Other Owner",
        `analytics-other-${suffix}@example.com`,
      ],
    );

    await db.insert(clients).values([
      {
        id: clientAId,
        ownerId,
        name: "Analytics Client A",
        createdAt: currentMonthStart,
      },
      {
        id: clientBId,
        ownerId,
        name: "Analytics Client B",
        createdAt: currentMonthStart,
      },
      {
        id: otherClientId,
        ownerId: otherOwnerId,
        name: "Other Owner Client",
        createdAt: previousMonthStart,
      },
    ]);

    await db.insert(services).values([
      {
        id: serviceAId,
        ownerId,
        name: "Bridal Makeup",
        durationMinutes: 120,
        priceKobo: 600000,
      },
      {
        id: serviceBId,
        ownerId,
        name: "Soft Glam",
        durationMinutes: 60,
        priceKobo: 300000,
      },
      {
        id: zeroServiceId,
        ownerId,
        name: "Unused Service",
        durationMinutes: 90,
        priceKobo: 200000,
      },
      {
        id: otherServiceId,
        ownerId: otherOwnerId,
        name: "Other Owner Service",
        durationMinutes: 60,
        priceKobo: 500000,
      },
    ]);

    // These UTC times fall within the current Lagos calendar month.
    const bookingDates = [2, 5, 8, 11, 14, 17].map(
      (hour) =>
        new Date(
          Date.UTC(
            current.year,
            current.month - 1,
            current.day,
            hour,
            0,
          ),
        ),
    );

    const bookingRows = [
      {
        id: bookingIds[0],
        ownerId,
        clientId: clientAId,
        serviceId: serviceAId,
        startsAt: bookingDates[0],
        endsAt: new Date(bookingDates[0].getTime() + 60 * 60 * 1000),
        priceKobo: 600000,
        status: "completed" as const,
      },
      {
        id: bookingIds[1],
        ownerId,
        clientId: clientAId,
        serviceId: serviceAId,
        startsAt: bookingDates[1],
        endsAt: new Date(bookingDates[1].getTime() + 60 * 60 * 1000),
        priceKobo: 400000,
        status: "completed" as const,
      },
      {
        id: bookingIds[2],
        ownerId,
        clientId: clientBId,
        serviceId: serviceAId,
        startsAt: bookingDates[2],
        endsAt: new Date(bookingDates[2].getTime() + 60 * 60 * 1000),
        priceKobo: 250000,
        status: "cancelled" as const,
      },
      {
        id: bookingIds[3],
        ownerId,
        clientId: clientBId,
        serviceId: serviceBId,
        startsAt: bookingDates[3],
        endsAt: new Date(bookingDates[3].getTime() + 60 * 60 * 1000),
        priceKobo: 300000,
        status: "no_show" as const,
      },
      {
        id: bookingIds[4],
        ownerId,
        clientId: clientBId,
        serviceId: serviceBId,
        startsAt: bookingDates[4],
        endsAt: new Date(bookingDates[4].getTime() + 60 * 60 * 1000),
        priceKobo: 350000,
        status: "scheduled" as const,
      },
      {
        id: bookingIds[5],
        ownerId: otherOwnerId,
        clientId: otherClientId,
        serviceId: otherServiceId,
        startsAt: bookingDates[5],
        endsAt: new Date(bookingDates[5].getTime() + 60 * 60 * 1000),
        priceKobo: 9999999,
        status: "completed" as const,
      },
    ];

    await db.insert(bookings).values(bookingRows);

    // Keep this reference so the test setup date is easy to inspect.
    expect(now).toBeInstanceOf(Date);
  });

  afterAll(async () => {
    if (sqlClient) {
      await sqlClient.query(
        `DELETE FROM bookings WHERE id = ANY($1::text[])`,
        [bookingIds],
      );

      await sqlClient.query(
        `DELETE FROM clients WHERE id = ANY($1::text[])`,
        [[clientAId, clientBId, otherClientId]],
      );

      await sqlClient.query(
        `DELETE FROM services WHERE id = ANY($1::text[])`,
        [[serviceAId, serviceBId, zeroServiceId, otherServiceId]],
      );

      await sqlClient.query(
        `DELETE FROM "user" WHERE id = ANY($1::text[])`,
        [[ownerId, otherOwnerId]],
      );

      await sqlClient.end();
    }
  });

  it("returns 12 months of revenue and counts completed bookings only", async () => {
    const result = await getMonthlyRevenue(ownerId);
    const current = getCurrentLagosDate();
    const currentMonth = getMonthKey(current.year, current.month);

    expect(result).toHaveLength(12);

    const thisMonth = result.find(
      (item) => item.month === currentMonth,
    );

    expect(thisMonth?.revenue).toBe(1000000);
  });

  it("returns monthly booking counts grouped by status", async () => {
    const result = await getMonthlyBookingStats(ownerId);
    const current = getCurrentLagosDate();
    const currentMonth = getMonthKey(current.year, current.month);

    expect(result).toHaveLength(12);

    const thisMonth = result.find(
      (item) => item.month === currentMonth,
    );

    expect(thisMonth).toMatchObject({
      total: 5,
      completed: 2,
      cancelled: 1,
      noShow: 1,
    });
  });

  it("returns service performance for the current owner only", async () => {
    const result = await getServicePerformance(ownerId);

    expect(result).toHaveLength(3);

    const bridalMakeup = result.find(
      (item) => item.serviceId === serviceAId,
    );

    expect(bridalMakeup).toMatchObject({
      totalBookings: 3,
      completedBookings: 2,
      revenue: 1000000,
    });

    const unusedService = result.find(
      (item) => item.serviceId === zeroServiceId,
    );

    expect(unusedService).toMatchObject({
      totalBookings: 0,
      completedBookings: 0,
      revenue: 0,
    });

    expect(
      result.some((item) => item.serviceId === otherServiceId),
    ).toBe(false);
  });

  it("returns client totals, new clients, and returning clients", async () => {
    const result = await getClientInsights(ownerId);

    const current = getCurrentLagosDate();
    const currentMonth = getMonthKey(current.year, current.month);

    expect(result.totalClients).toBe(2);
    expect(result.returningClients).toBe(1);

    const thisMonth = result.newClients.find(
      (item) => item.month === currentMonth,
    );

    expect(thisMonth?.total).toBe(2);
  });
});