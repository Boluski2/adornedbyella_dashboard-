import { headers } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/db/auth";
import { NewBookingButton, ViewAllButton } from "./dashboard-actions";
import SignOutButton from "./sign-out-button";
import { and, asc, count, eq, gte, lt, sum, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookings, clients, services } from "@/lib/db/app-schema";

const navigation = [
  { label: "Overview", icon: "◫", active: true },
  { label: "Bookings", icon: "▦", active: false },
  { label: "Clients", icon: "♙", active: false },
  { label: "Services", icon: "✳", active: false },
];


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
  const now = new Date();

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
    <main className="min-h-screen bg-[#faf8f5] text-[#272321] md:flex">
      <aside className="border-b border-[#eae4df] bg-white p-5 md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col md:border-r md:border-b-0">
        <a href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#a65d69] text-xl text-white">
            G
          </span>
          <span>
            <span className="block text-lg font-semibold tracking-tight">
              GlamTrack
            </span>
            <span className="block text-xs text-[#827873]">
              Beauty business manager
            </span>
          </span>
        </a>

        <p className="mb-3 mt-10 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a39a94]">
          Workspace
        </p>

        <nav className="flex gap-2 overflow-x-auto md:flex-col">
          {navigation.map((item) => (
            <a
              key={item.label}
              href={item.active ? "/" : "#"}
              aria-current={item.active ? "page" : undefined}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                item.active
                  ? "bg-[#f5e8e9] font-medium text-[#914b57]"
                  : "text-[#716964] hover:bg-[#faf8f5]"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mt-8 hidden rounded-2xl bg-[#faf5f1] p-4 md:block">
          <p className="text-sm font-medium">Your business, organized.</p>
          <p className="mt-2 text-xs leading-5 text-[#827873]">
            Keep appointments, client details, and services in one place.
          </p>
        </div>
          <div className="mt-auto hidden border-t border-[#eae4df] pt-5 md:block">
            <a
              href="#settings"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#716964] hover:bg-[#faf8f5]"
            >
              <span>⚙</span>
              Settings
            </a>

            <div className="mt-2">
              <SignOutButton />
            </div>

            <p className="mt-4 text-xs text-[#a39a94]">
              GlamTrack · Preview
            </p>
          </div>
      </aside>

      <section className="min-w-0 flex-1 p-5 sm:p-8 md:ml-64 md:p-10">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#eae4df] pb-7">
          <div>
            <p className="text-sm text-[#827873]">Your workspace / Overview</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Good morning
            </h1>
            <p className="mt-2 text-sm text-[#827873]">
              Here&apos;s what&apos;s happening with your business.
            </p>
          </div>

          <NewBookingButton />
        </header>

        <div className="mt-6 rounded-xl border border-[#ead8d5] bg-[#f8efeb] px-4 py-3 text-sm text-[#80565a]">
          <span className="font-semibold">Preview mode</span>
          <span className="ml-2">
            The figures and appointments below are sample data, not real
            business records.
          </span>
        </div>

        <section aria-label="Business summary" className="mt-7">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Business overview</h2>
            <span className="text-xs text-[#827873]">Sample figures</span>
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

          <div className="hidden grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_100px_110px] gap-4 bg-[#fcfbf9] px-6 py-3 text-xs font-medium text-[#827873] sm:grid">
            <span>Client</span>
            <span>Service</span>
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

                  const statusLabel =
                    booking.status === "confirmed" ? "Confirmed" : "Scheduled";

                  return (
                    <article
                      key={booking.id}
                      className="grid gap-3 p-5 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_100px_110px] sm:items-center sm:gap-4 sm:px-6"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-xs font-semibold text-rose-800">
                          {initials || "C"}
                        </span>
                        <div>
                          <p className="text-sm font-medium">{booking.clientName}</p>
                          <p className="mt-1 text-xs text-[#827873] sm:hidden">
                            {booking.serviceName}
                          </p>
                        </div>
                      </div>

                      <p className="hidden text-sm text-[#716964] sm:block">
                        {booking.serviceName}
                      </p>

                      <p className="text-sm text-[#716964]">{time}</p>

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
          GlamTrack · Built for your beauty business
        </footer>
      </section>
    </main>
  );
}
