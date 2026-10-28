import { headers } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/db/auth";
import { NewBookingButton, ViewAllButton } from "./dashboard-actions";
import SignOutButton from "./sign-out-button";

const navigation = [
  { label: "Overview", icon: "◫", active: true },
  { label: "Bookings", icon: "▦", active: false },
  { label: "Clients", icon: "♙", active: false },
  { label: "Services", icon: "✳", active: false },
];

const demoBookings = [
  {
    name: "Amara Johnson",
    service: "Bridal makeup",
    time: "09:00 AM",
    status: "Confirmed",
    initials: "AJ",
    color: "bg-rose-100 text-rose-800",
  },
  {
    name: "Zainab Bello",
    service: "Soft glam",
    time: "11:30 AM",
    status: "Scheduled",
    initials: "ZB",
    color: "bg-amber-100 text-amber-800",
  },
  {
    name: "Tomi Williams",
    service: "Birthday glam",
    time: "02:00 PM",
    status: "Confirmed",
    initials: "TW",
    color: "bg-violet-100 text-violet-800",
  },
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
              value="3"
              detail="Sample daily schedule"
              symbol="▦"
            />
            <MetricCard
              label="Total clients"
              value="128"
              detail="Sample client count"
              symbol="♙"
            />
            <MetricCard
              label="Monthly revenue"
              value="₦485,000"
              detail="Illustrative amount only"
              symbol="₦"
            />
            <MetricCard
              label="Services offered"
              value="8"
              detail="Sample service count"
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
            {demoBookings.map((booking) => (
              <article
                key={booking.name}
                className="grid gap-3 p-5 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_100px_110px] sm:items-center sm:gap-4 sm:px-6"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${booking.color}`}
                  >
                    {booking.initials}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{booking.name}</p>
                    <p className="mt-1 text-xs text-[#827873] sm:hidden">
                      {booking.service}
                    </p>
                  </div>
                </div>
                <p className="hidden text-sm text-[#716964] sm:block">
                  {booking.service}
                </p>
                <p className="text-sm text-[#716964]">{booking.time}</p>
                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
                    booking.status === "Confirmed"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {booking.status}
                </span>
              </article>
            ))}
          </div>

          <div className="border-t border-[#eee9e5] bg-[#fcfbf9] px-5 py-3 text-xs text-[#827873] sm:px-6">
            Example appointments · Not connected to the database
          </div>
        </section>

        <footer className="py-8 text-center text-xs text-[#a39a94]">
          GlamTrack · Built for your beauty business
        </footer>
      </section>
    </main>
  );
}
