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

function formatNaira(amountInKobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amountInKobo / 100);
}

export default async function AnalyticsPage() {
  await connection();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const ownerId = session.user.id;
  const [revenue, bookingStats, servicePerformance, clientInsights] =
    await Promise.all([
      getMonthlyRevenue(ownerId),
      getMonthlyBookingStats(ownerId),
      getServicePerformance(ownerId),
      getClientInsights(ownerId),
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
      detail: "From completed appointments · 12 months",
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
      detail: "Appointments in the last 12 months",
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
    <main className="min-h-screen bg-[#faf8f5] px-5 py-8 text-[#272321] sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
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

          <div className="inline-flex items-center gap-2 rounded-xl border border-[#eae4df] bg-white px-4 py-2.5 text-sm font-medium text-[#514a46] shadow-sm">
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              className="h-4 w-4 text-[#a65d69]"
            >
              <path
                d="M6.25 2.5v2.25M13.75 2.5v2.25M3.5 7.25h13M4.25 4h11.5A1.75 1.75 0 0 1 17.5 5.75v9.5A1.75 1.75 0 0 1 15.75 17H4.25a1.75 1.75 0 0 1-1.75-1.75v-9.5A1.75 1.75 0 0 1 4.25 4Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Last 12 months
          </div>
        </header>

        <section
          aria-label="Performance summary"
          className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5"
        >
          {summaryCards.map((card) => (
            <article
              key={card.title}
              className="rounded-2xl border border-[#eae4df] bg-white p-5 shadow-sm shadow-[#35251e]/[0.03]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#827873]">
                    {card.title}
                  </p>
                  <p className={`mt-3 break-words text-2xl font-semibold tracking-tight text-[#272321] ${card.valueClassName ?? ""}`}>
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
