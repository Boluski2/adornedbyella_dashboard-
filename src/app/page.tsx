import type { Metadata } from "next";
import { headers } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/db/auth";
import { ViewAllButton } from "./dashboard-actions";
import DashboardShell from "./dashboard-shell";
import { and, asc, count, eq, gte, lt, sum, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookings, clients, services } from "@/lib/db/app-schema";
import Link from "next/link";
import BookingCalendar from "./bookings/booking-calendar";
import AnalyticsCharts from "./analytics/analytics-charts";
import OverviewCreateActions from "./overview-create-actions";
import {
  getMonthlyBookingStats,
  getMonthlyRevenue,
  getClientInsights,
  getServicePerformance,
} from "@/lib/db/analytics";
import { getBusinessProfile } from "@/lib/db/business-profiles";

export async function generateMetadata(): Promise<Metadata> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return {
      title: "AdornedByElla",
      description: "Manage your beauty business with AdornedByElla.",
    };
  }

  const profile = await getBusinessProfile(session.user.id);

  return {
    title: profile?.brandName || "AdornedByElla",
    description:
      profile?.slogan || "Manage your beauty business with AdornedByElla.",
  };
}


function MetricCard({
  label,
  value,
  detail,
  symbol,
}: {
  label: string;
  value: string;
  detail: string;
  symbol: string;
}) {
  return (
    <article className="rounded-2xl border border-[#eae4df] bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#827873]">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5e8e9] text-lg text-[#a65d69]">
          {symbol}
        </span>
      </div>
      <p className="mt-5 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-xs text-[#827873]">{detail}</p>
    </article>
  );
}

export default async function Home() {
  await connection();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

if (!session) {
  redirect("/sign-in");
}

const ownerId = session.user.id;

const businessProfile = await getBusinessProfile(ownerId);

if (!businessProfile) {
  redirect("/onboarding/profile");
}
  const now = new Date();
  const lagosHour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Lagos",
      hour: "2-digit",
      hourCycle: "h23",
    }).format(now),
  );
  const greeting =
    lagosHour < 12
      ? "Good morning"
      : lagosHour < 17
        ? "Good afternoon"
        : "Good evening";

  // Use Lagos business time for today's appointments and monthly revenue.
  const businessDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  const [year, month, day] = businessDate.split("-").map(Number);

  const dayStart = new Date(Date.UTC(year, month - 1, day, -1));
  const dayEnd = new Date(Date.UTC(year, month - 1, day, 23));
  const monthStart = new Date(Date.UTC(year, month - 1, 1, -1));
  const nextMonthStart = new Date(Date.UTC(year, month, 1, -1));

  const [
    todayResult,
    clientsResult,
    revenueResult,
    servicesResult,
    upcomingBookings,
    clientOptions,
    serviceOptions,
    calendarRows,
    revenueAnalytics,
    bookingAnalytics,
    clientAnalytics,
    serviceAnalytics,
  ] = await Promise.all([
    db
      .select({ value: count() })
      .from(bookings)
      .where(
        and(
          eq(bookings.ownerId, ownerId),
          inArray(bookings.status, ["scheduled", "confirmed"]),
          gte(bookings.startsAt, dayStart),
          lt(bookings.startsAt, dayEnd),
        ),
      ),

    db
      .select({ value: count() })
      .from(clients)
      .where(eq(clients.ownerId, ownerId)),

    db
      .select({ value: sum(bookings.priceKobo) })
      .from(bookings)
      .where(
        and(
          eq(bookings.ownerId, ownerId),
          eq(bookings.status, "completed"),
          gte(bookings.startsAt, monthStart),
          lt(bookings.startsAt, nextMonthStart),
        ),
      ),

    db
      .select({ value: count() })
      .from(services)
      .where(
        and(
          eq(services.ownerId, ownerId),
          eq(services.isActive, true),
        ),
      ),

    db
      .select({
        id: bookings.id,
        startsAt: bookings.startsAt,
        status: bookings.status,
        clientName: clients.name,
        serviceName: services.name,
      })
      .from(bookings)
      .innerJoin(
        clients,
        and(
          eq(bookings.clientId, clients.id),
          eq(bookings.ownerId, clients.ownerId),
        ),
      )
      .innerJoin(
        services,
        and(
          eq(bookings.serviceId, services.id),
          eq(bookings.ownerId, services.ownerId),
        ),
      )
      .where(
        and(
          eq(bookings.ownerId, ownerId),
          inArray(bookings.status, ["scheduled", "confirmed"]),
          gte(bookings.startsAt, now),
        ),
      )
      .orderBy(asc(bookings.startsAt))
      .limit(5),
    db
      .select({ id: clients.id, name: clients.name })
      .from(clients)
      .where(eq(clients.ownerId, ownerId))
      .orderBy(asc(clients.name)),
    db
      .select({
        id: services.id,
        name: services.name,
        durationMinutes: services.durationMinutes,
        priceKobo: services.priceKobo,
      })
      .from(services)
      .where(and(eq(services.ownerId, ownerId), eq(services.isActive, true)))
      .orderBy(asc(services.name)),
    db
      .select({
        id: bookings.id,
        startsAt: bookings.startsAt,
        endsAt: bookings.endsAt,
        status: bookings.status,
        priceKobo: bookings.priceKobo,
        clientName: clients.name,
        serviceName: services.name,
      })
      .from(bookings)
      .innerJoin(clients, and(eq(bookings.clientId, clients.id), eq(bookings.ownerId, clients.ownerId)))
      .innerJoin(services, and(eq(bookings.serviceId, services.id), eq(bookings.ownerId, services.ownerId)))
      .where(eq(bookings.ownerId, ownerId))
      .orderBy(asc(bookings.startsAt)),
    getMonthlyRevenue(ownerId),
    getMonthlyBookingStats(ownerId),
    getClientInsights(ownerId),
    getServicePerformance(ownerId),
  ]);

  const todayAppointments = todayResult[0]?.value ?? 0;
  const totalClients = clientsResult[0]?.value ?? 0;
  const monthlyRevenueKobo = Number(revenueResult[0]?.value ?? 0);
  const activeServices = servicesResult[0]?.value ?? 0;

  const formatNaira = (kobo: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(kobo / 100);

  return (
    <DashboardShell
      brandName={businessProfile.brandName}
      slogan={businessProfile.slogan}
      logoUrl={businessProfile.logoUrl}
    >
      <main className="min-w-0 p-5 sm:p-8 md:p-10">

        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#eae4df] pb-7">
          <div>
            <p className="text-sm text-[#827873]">Your workspace / Overview</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              {greeting}
            </h1>
            <p className="mt-2 text-sm text-[#827873]">
              Here&apos;s what&apos;s happening with your business.
            </p>
          </div>

        </header>

        <OverviewCreateActions clients={clientOptions} services={serviceOptions} />

        <section aria-label="Business summary" className="mt-7">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Business overview</h2>
            <span className="text-xs text-[#827873]">Your account</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Appointments today"
            value={String(todayAppointments)}
            detail="Scheduled and confirmed"
            symbol="▦"
          />
          <MetricCard
            label="Total clients"
            value={String(totalClients)}
            detail="Registered clients"
            symbol="♙"
          />
          <MetricCard
            label="Monthly revenue"
            value={formatNaira(monthlyRevenueKobo)}
            detail="From completed bookings"
            symbol="₦"
          />
          <MetricCard
            label="Services offered"
            value={String(activeServices)}
            detail="Active services"
            symbol="✳"
          />
          </div>
        </section>

        <section className="mt-10" aria-label="Analytics overview">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Analytics overview</h2>
              <p className="mt-1 text-sm text-[#827873]">
                Revenue, bookings, and client growth over the last 12 months.
              </p>
            </div>
            <Link href="/analytics" className="text-sm font-medium text-[#914b57] hover:underline">
              View full analytics
            </Link>
          </div>
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-5">
            {[
              {
                label: "12-month revenue",
                value: formatNaira(revenueAnalytics.reduce((sum, month) => sum + month.revenue, 0)),
              },
              {
                label: "Bookings",
                value: bookingAnalytics.reduce((sum, month) => sum + month.total, 0).toLocaleString("en-NG"),
              },
              {
                label: "Completed",
                value: bookingAnalytics.reduce((sum, month) => sum + month.completed, 0).toLocaleString("en-NG"),
              },
              {
                label: "Cancelled",
                value: bookingAnalytics.reduce((sum, month) => sum + month.cancelled, 0).toLocaleString("en-NG"),
              },
              {
                label: "Top service",
                value: serviceAnalytics[0]?.serviceName ?? "No services yet",
              },
            ].map((metric) => (
              <article key={metric.label} className="min-w-0 rounded-2xl border border-[#eae4df] bg-white p-3 sm:p-5">
                <p className="text-sm text-[#827873]">{metric.label}</p>
                <p className="mt-2 break-words text-lg font-semibold tracking-tight sm:mt-3 sm:text-xl">{metric.value}</p>
              </article>
            ))}
          </div>
          <AnalyticsCharts
            revenue={revenueAnalytics}
            bookingStats={bookingAnalytics}
            clientInsights={clientAnalytics}
          />
        </section>

        <section className="mt-8" aria-label="Appointment calendar">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Booking calendar</h2>
              <p className="mt-1 text-sm text-[#827873]">
                View and schedule appointments from your overview.
              </p>
            </div>
            <Link href="/bookings" className="text-sm font-medium text-[#914b57] hover:underline">
              Manage bookings
            </Link>
          </div>
          <BookingCalendar
            bookings={calendarRows.map((booking) => ({
              ...booking,
              startsAt: new Date(booking.startsAt).toISOString(),
              endsAt: new Date(booking.endsAt).toISOString(),
            }))}
            clients={clientOptions}
            services={serviceOptions}
          />
        </section>

        <section
          id="appointments"
          className="mt-8 overflow-hidden rounded-2xl border border-[#eae4df] bg-white"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eee9e5] p-5 sm:p-6">
            <div>
              <h2 className="font-semibold">Upcoming appointments</h2>
              <p className="mt-1 text-sm text-[#827873]">
                A preview of your daily schedule
              </p>
            </div>
            <ViewAllButton />
          </div>

          <div className="hidden grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_110px_85px_100px] gap-3 bg-[#fcfbf9] px-6 py-3 text-xs font-medium text-[#827873] sm:grid sm:gap-4">
            <span>Client</span>
            <span>Service</span>
            <span>Date</span>
            <span>Time</span>
            <span>Status</span>
          </div>

            <div className="divide-y divide-[#eee9e5]">
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map((booking) => {
                  const initials = booking.clientName
                    .trim()
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase() ?? "")
                    .join("");

                  const time = new Intl.DateTimeFormat("en-NG", {
                    timeZone: "Africa/Lagos",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  }).format(new Date(booking.startsAt));
                  const date = new Intl.DateTimeFormat("en-NG", {
                    timeZone: "Africa/Lagos",
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  }).format(new Date(booking.startsAt));

                  const statusLabel =
                    booking.status === "confirmed" ? "Confirmed" : "Scheduled";

                  return (
                    <article
                      key={booking.id}
                      className="grid gap-3 p-5 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_110px_85px_100px] sm:items-center sm:gap-4 sm:px-6"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-xs font-semibold text-rose-800">
                          {initials || "C"}
                        </span>
                        <div>
                          <p className="text-sm font-medium">{booking.clientName}</p>
                          <p className="mt-1 text-xs text-[#827873] sm:hidden">
                            {date} · {time}
                          </p>
                          <p className="mt-1 text-xs text-[#827873] sm:hidden">
                            {booking.serviceName}
                          </p>
                        </div>
                      </div>

                      <p className="hidden text-sm text-[#716964] sm:block">
                        {booking.serviceName}
                      </p>

                      <p className="hidden text-sm text-[#716964] sm:block">{date}</p>

                      <p className="hidden text-sm text-[#716964] sm:block">{time}</p>

                      <span
                        className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
                          booking.status === "confirmed"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {statusLabel}
                      </span>
                    </article>
                  );
                })
              ) : (
                <div className="px-5 py-10 text-center sm:px-6">
                  <p className="text-sm font-medium text-[#38312e]">
                    No upcoming appointments
                  </p>
                  <p className="mt-1 text-sm text-[#827873]">
                    Your next bookings will appear here.
                  </p>
                </div>
              )}
            </div>
        </section>

        <footer className="py-8 text-center text-xs text-[#a39a94]">
          {businessProfile.brandName} · {businessProfile.slogan}
        </footer>

      </main>
    </DashboardShell>
  );
}
