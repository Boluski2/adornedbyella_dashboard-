import { headers } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { auth } from "@/lib/db/auth";
import {
  getMonthlyRevenue,
  getMonthlyBookingStats,
  getServicePerformance,
  getClientInsights,
} from "@/lib/db/analytics";

import AnalyticsCharts from "./analytics-charts";
import BackToOverview from "../back-to-overview";

function formatNaira(amountInKobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amountInKobo / 100);
}

function getCurrentLagosPeriod() {
  const values = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos", year: "numeric", month: "2-digit",
  }).formatToParts(new Date()).map((part) => [part.type, part.value]));
  return { year: Number(values.year), month: Number(values.month) };
}

export default async function AnalyticsPage({
  searchParams,
}: { searchParams?: Promise<{ view?: string; year?: string; month?: string }> }) {
  await connection();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const ownerId = session.user.id;
  const current = getCurrentLagosPeriod();
  const params = (await searchParams) ?? {};
  const view = params.view === "month" ? "month" : "year";
  const requestedYear = Number(params.year);
  const requestedMonth = Number(params.month);
  const selectedYear = Number.isInteger(requestedYear) && requestedYear >= 2000 && requestedYear <= current.year
    ? requestedYear
    : current.year;
  const selectedMonth = Number.isInteger(requestedMonth) && requestedMonth >= 1 && requestedMonth <= 12
    ? requestedMonth
    : current.month;
  const period = { year: selectedYear, ...(view === "month" ? { month: selectedMonth } : {}) };
  const periodLabel = view === "month"
    ? new Intl.DateTimeFormat("en-NG", { month: "long", year: "numeric" }).format(new Date(Date.UTC(selectedYear, selectedMonth - 1, 1)))
    : String(selectedYear);
  const yearOptions = Array.from({ length: 7 }, (_, index) => current.year - index);
  const [revenue, bookingStats, servicePerformance, clientInsights] =
    await Promise.all([
      getMonthlyRevenue(ownerId, period),
      getMonthlyBookingStats(ownerId, period),
      getServicePerformance(ownerId, period),
      getClientInsights(ownerId, period),
    ]);

  const totalRevenue = revenue.reduce(
    (total, item) => total + item.revenue,
    0,
  );
  const totalBookings = bookingStats.reduce(
    (total, item) => total + item.total,
    0,
  );
  const completedBookings = bookingStats.reduce(
    (total, item) => total + item.completed,
    0,
  );
  const cancelledBookings = bookingStats.reduce(
    (total, item) => total + item.cancelled,
    0,
  );

  const summaryCards = [
    {
      title: "Revenue",
      value: formatNaira(totalRevenue),
      detail: `From completed appointments · ${periodLabel}`,
      symbol: "₦",
      tone: "bg-[#f5e8e9] text-[#a65d69]",
    },
    {
      title: "Service Performance",
      value: servicePerformance[0]?.serviceName ?? "No services yet",
      detail: servicePerformance[0]
        ? `${servicePerformance[0].totalBookings.toLocaleString("en-NG")} bookings · ${formatNaira(servicePerformance[0].revenue)} earned`
        : "Add a service to see its results",
      symbol: "✳",
      tone: "bg-[#f5f0e8] text-[#94744b]",
      valueClassName: "text-lg leading-snug line-clamp-2",
    },
    {
      title: "Bookings",
      value: totalBookings.toLocaleString("en-NG"),
      detail: `Appointments · ${periodLabel}`,
      symbol: "▦",
      tone: "bg-[#f5f0e8] text-[#94744b]",
    },
    {
      title: "Completed",
      value: completedBookings.toLocaleString("en-NG"),
      detail: "Successfully completed appointments",
      symbol: "✓",
      tone: "bg-[#eaf3ec] text-[#5a8064]",
    },
    {
      title: "Cancelled",
      value: cancelledBookings.toLocaleString("en-NG"),
      detail: "Cancelled appointments",
      symbol: "×",
      tone: "bg-[#f8eeee] text-[#a05d5d]",
    },
  ];

  return (
    <main className="min-h-screen bg-[#faf8f5] px-4 py-6 text-[#272321] sm:px-8 sm:py-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <BackToOverview />
        <header className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a65d69]">
              Workspace / Analytics
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Business performance
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#827873]">
              Understand your revenue, appointments, services, and client growth.
            </p>
          </div>

          <form method="get" className="flex flex-wrap items-end gap-2 rounded-xl border border-[#eae4df] bg-white p-2 shadow-sm">
            <label className="sr-only" htmlFor="analytics-view">Period</label>
            <select id="analytics-view" name="view" defaultValue={view} className="rounded-lg border border-[#eae4df] px-2.5 py-2 text-sm font-medium text-[#514a46]"><option value="year">Yearly</option><option value="month">Monthly</option></select>
            <label className="sr-only" htmlFor="analytics-year">Year</label>
            <select id="analytics-year" name="year" defaultValue={selectedYear} className="rounded-lg border border-[#eae4df] px-2.5 py-2 text-sm font-medium text-[#514a46]">
              {yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
            {view === "month" && <>
              <label className="sr-only" htmlFor="analytics-month">Month</label>
              <select id="analytics-month" name="month" defaultValue={selectedMonth} className="rounded-lg border border-[#eae4df] px-2.5 py-2 text-sm font-medium text-[#514a46]">
                {Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>{new Intl.DateTimeFormat("en-NG", { month: "long" }).format(new Date(Date.UTC(2020, index, 1)))}</option>)}
              </select>
            </>}
            <button type="submit" className="rounded-lg bg-[#a65d69] px-3 py-2 text-sm font-semibold text-white">Apply</button>
          </form>
        </header>

        <section
          aria-label="Performance summary"
          className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-5"
        >
          {summaryCards.map((card) => (
            <article
              key={card.title}
              className="min-w-0 rounded-2xl border border-[#eae4df] bg-white p-3 shadow-sm shadow-[#35251e]/[0.03] sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#827873]">
                    {card.title}
                  </p>
                  <p className={`mt-2 break-words text-lg font-semibold tracking-tight text-[#272321] sm:mt-3 sm:text-2xl ${card.valueClassName ?? ""}`}>
                    {card.value}
                  </p>
                </div>
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-semibold ${card.tone}`}
                  aria-hidden="true"
                >
                  {card.symbol}
                </span>
              </div>
              <p className="mt-3 text-xs leading-5 text-[#a39a94]">
                {card.detail}
              </p>
            </article>
          ))}
        </section>

        <AnalyticsCharts
          revenue={revenue}
          bookingStats={bookingStats}
          clientInsights={clientInsights}
        />
      </div>
    </main>
  );
}
