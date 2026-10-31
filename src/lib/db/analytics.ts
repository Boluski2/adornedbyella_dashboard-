import { and, eq, gte, lt, sql, sum, count } from "drizzle-orm";

import { db } from "@/lib/db";
import { bookings, clients, services } from "./app-schema";

function getLagosDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  return { year, month, day };
}

function getLagosMonthStart(year: number, month: number) {
  return new Date(Date.UTC(year, month - 1, 1, -1));
}

function getLast12Months(now: Date) {
  const { year, month } = getLagosDateParts(now);

  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 1 - (11 - index), 1));

    return {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      label: new Intl.DateTimeFormat("en-NG", {
        month: "short",
        year: "numeric",
        timeZone: "Africa/Lagos",
      }).format(date),
    };
  });
}

export type AnalyticsPeriod = {
  year?: number;
  month?: number;
};

function getPeriodMonths(now: Date, period?: AnalyticsPeriod) {
  if (!period?.year) return getLast12Months(now);

  const firstMonth = period.month ?? 1;
  const count = period.month ? 1 : 12;

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(Date.UTC(period.year!, firstMonth - 1 + index, 1));

    return {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      label: new Intl.DateTimeFormat("en-NG", {
        month: "short",
        year: "numeric",
        timeZone: "Africa/Lagos",
      }).format(date),
    };
  });
}


export async function getMonthlyRevenue(ownerId: string, period?: AnalyticsPeriod) {
  const now = new Date();
  const months = getPeriodMonths(now, period);

  const firstMonth = months[0];

  const startDate = getLagosMonthStart(
    firstMonth.year,
    firstMonth.month,
  );

  const lastMonth = months[months.length - 1];

  const endDate = getLagosMonthStart(
    lastMonth.year,
    lastMonth.month + 1,
  );

  const result = await db
    .select({
      month: sql<string>`
        to_char(
          ${bookings.startsAt} AT TIME ZONE 'Africa/Lagos',
          'YYYY-MM'
        )
      `,
      revenue: sum(bookings.priceKobo),
    })
    .from(bookings)
    .where(
      and(
        eq(bookings.ownerId, ownerId),
        eq(bookings.status, "completed"),
        gte(bookings.startsAt, startDate),
        lt(bookings.startsAt, endDate),
      ),
    )
    .groupBy(sql`
      to_char(
        ${bookings.startsAt} AT TIME ZONE 'Africa/Lagos',
        'YYYY-MM'
      )
    `);

  const revenueMap = new Map(
    result.map((item) => [
      item.month,
      Number(item.revenue ?? 0),
    ]),
  );

  return months.map((item) => ({
    month: `${item.year}-${String(item.month).padStart(2, "0")}`,
    label: item.label,
    revenue: revenueMap.get(
      `${item.year}-${String(item.month).padStart(2, "0")}`,
    ) ?? 0,
  }));
}

export async function getMonthlyBookingStats(ownerId: string, period?: AnalyticsPeriod) {
  const now = new Date();
  const months = getPeriodMonths(now, period);

  const firstMonth = months[0];
  const lastMonth = months[months.length - 1];

  const startDate = getLagosMonthStart(
    firstMonth.year,
    firstMonth.month,
  );

  const endDate = getLagosMonthStart(
    lastMonth.year,
    lastMonth.month + 1,
  );

  const result = await db
    .select({
      month: sql<string>`
        to_char(
          ${bookings.startsAt} AT TIME ZONE 'Africa/Lagos',
          'YYYY-MM'
        )
      `,
      total: count(),
      completed: sql<number>`
        count(*) filter (where ${bookings.status} = 'completed')
      `,
      cancelled: sql<number>`
        count(*) filter (where ${bookings.status} = 'cancelled')
      `,
      noShow: sql<number>`
        count(*) filter (where ${bookings.status} = 'no_show')
      `,
    })
    .from(bookings)
    .where(
      and(
        eq(bookings.ownerId, ownerId),
        gte(bookings.startsAt, startDate),
        lt(bookings.startsAt, endDate),
      ),
    )
    .groupBy(sql`
      to_char(
        ${bookings.startsAt} AT TIME ZONE 'Africa/Lagos',
        'YYYY-MM'
      )
    `);

  const statsMap = new Map(
    result.map((item) => [
      item.month,
      {
        total: Number(item.total),
        completed: Number(item.completed),
        cancelled: Number(item.cancelled),
        noShow: Number(item.noShow),
      },
    ]),
  );

  return months.map((item) => {
    const key = `${item.year}-${String(item.month).padStart(2, "0")}`;

    return {
      month: key,
      label: item.label,
      ...(statsMap.get(key) ?? {
        total: 0,
        completed: 0,
        cancelled: 0,
        noShow: 0,
      }),
    };
  });
}


export async function getServicePerformance(ownerId: string, period?: AnalyticsPeriod) {
  const months = period?.year ? getPeriodMonths(new Date(), period) : undefined;
  const startDate = months ? getLagosMonthStart(months[0].year, months[0].month) : undefined;
  const lastMonth = months?.[months.length - 1];
  const endDate = lastMonth
    ? getLagosMonthStart(lastMonth.year, lastMonth.month + 1)
    : undefined;

  const result = await db
    .select({
      serviceId: services.id,
      serviceName: services.name,
      totalBookings: count(bookings.id),
      completedBookings: sql<number>`
        count(${bookings.id})
        filter (where ${bookings.status} = 'completed')
      `,
      revenue: sql<number>`
        coalesce(
          sum(${bookings.priceKobo})
          filter (where ${bookings.status} = 'completed'),
          0
        )
      `,
    })
    .from(services)
    .leftJoin(
      bookings,
      and(
        eq(bookings.serviceId, services.id),
        eq(bookings.ownerId, ownerId),
        ...(startDate && endDate
          ? [gte(bookings.startsAt, startDate), lt(bookings.startsAt, endDate)]
          : []),
      ),
    )
    .where(eq(services.ownerId, ownerId))
    .groupBy(services.id, services.name);

  return result
    .map((item) => ({
      ...item,
      totalBookings: Number(item.totalBookings),
      completedBookings: Number(item.completedBookings),
      revenue: Number(item.revenue),
    }))
    .sort((a, b) => b.revenue - a.revenue);
}


export async function getClientInsights(ownerId: string, period?: AnalyticsPeriod) {
  const now = new Date();
  const months = getPeriodMonths(now, period);

  const firstMonth = months[0];
  const lastMonth = months[months.length - 1];

  const startDate = getLagosMonthStart(
    firstMonth.year,
    firstMonth.month,
  );

  const endDate = getLagosMonthStart(
    lastMonth.year,
    lastMonth.month + 1,
  );

  const [totalResult, newClientResult, returningClientResult, topClientResult] =
    await Promise.all([
      db
        .select({
          total: count(),
        })
        .from(clients)
        .where(eq(clients.ownerId, ownerId)),

      db
        .select({
          month: sql<string>`
            to_char(
              ${clients.createdAt} AT TIME ZONE 'Africa/Lagos',
              'YYYY-MM'
            )
          `,
          total: count(),
        })
        .from(clients)
        .where(
          and(
            eq(clients.ownerId, ownerId),
            gte(clients.createdAt, startDate),
            lt(clients.createdAt, endDate),
          ),
        )
        .groupBy(
          sql`
            to_char(
              ${clients.createdAt} AT TIME ZONE 'Africa/Lagos',
              'YYYY-MM'
            )
          `,
        ),

      db
        .select({
          clientId: bookings.clientId,
        })
        .from(bookings)
        .where(
          and(
            eq(bookings.ownerId, ownerId),
            eq(bookings.status, "completed"),
            gte(bookings.startsAt, startDate),
            lt(bookings.startsAt, endDate),
          ),
        )
        .groupBy(bookings.clientId)
        .having(sql`count(*) >= 2`),

      db
        .select({
          clientId: clients.id,
          clientName: clients.name,
          serviceName: services.name,
          totalBookings: count(bookings.id),
        })
        .from(bookings)
        .innerJoin(
          clients,
          and(eq(clients.id, bookings.clientId), eq(clients.ownerId, ownerId)),
        )
        .innerJoin(services, eq(services.id, bookings.serviceId))
        .where(
          and(
            eq(bookings.ownerId, ownerId),
            gte(bookings.startsAt, startDate),
            lt(bookings.startsAt, endDate),
          ),
        )
        .groupBy(clients.id, clients.name, services.name),
    ]);

  const newClientMap = new Map(
    newClientResult.map((item) => [
      item.month,
      Number(item.total),
    ]),
  );

  const clientMap = new Map<string, {
    clientId: string;
    name: string;
    totalBookings: number;
    services: string[];
  }>();

  for (const item of topClientResult) {
    const existing = clientMap.get(item.clientId) ?? {
      clientId: item.clientId,
      name: item.clientName,
      totalBookings: 0,
      services: [],
    };

    existing.totalBookings += Number(item.totalBookings);
    existing.services.push(`${item.serviceName} (${Number(item.totalBookings)})`);
    clientMap.set(item.clientId, existing);
  }

  const clientRanking = Array.from(clientMap.values()).sort(
    (a, b) => b.totalBookings - a.totalBookings,
  );
  const highestBookingCount = clientRanking[0]?.totalBookings ?? 0;

  return {
    totalClients: Number(totalResult[0]?.total ?? 0),
    returningClients: returningClientResult.length,
    topClients: clientRanking.filter(
      (client) => client.totalBookings === highestBookingCount,
    ),
    newClients: months.map((item) => {
      const key = `${item.year}-${String(item.month).padStart(2, "0")}`;

      return {
        month: key,
        label: item.label,
        total: newClientMap.get(key) ?? 0,
      };
    }),
  };
}
