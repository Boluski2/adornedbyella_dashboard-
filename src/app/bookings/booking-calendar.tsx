"use client";

import { useMemo, useState } from "react";

import BookingStatusControl from "./booking-status-control";
import CancelBookingButton from "./cancel-booking-button";
import BookingForm from "./booking-form";

type CalendarBooking = {
  id: string;
  startsAt: string;
  endsAt: string;
  clientName: string;
  serviceName: string;
  status: string;
  priceKobo: number;
};

type ClientOption = {
  id: string;
  name: string;
};

type ServiceOption = {
  id: string;
  name: string;
  durationMinutes: number;
  priceKobo: number;
};

type ViewMode = "month" | "week" | "day";

type BookingStatusFilter =
  | "all"
  | "scheduled"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

const TIME_ZONE = "Africa/Lagos";

const dateKey = (date: Date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

const dayStart = (date: Date) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const part = (type: string) =>
    Number(parts.find((item) => item.type === type)?.value);

  return new Date(Date.UTC(part("year"), part("month") - 1, part("day")));
};

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat("en-NG", {
    timeZone: TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

const formatLongDate = (date: Date) =>
  new Intl.DateTimeFormat("en-NG", {
    timeZone: TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

const formatMonth = (date: Date) =>
  new Intl.DateTimeFormat("en-NG", {
    timeZone: TIME_ZONE,
    month: "long",
    year: "numeric",
  }).format(date);

const statusStyles: Record<string, string> = {
  scheduled: "border-[#ead9bb] bg-[#fff8e9] text-[#8b6728]",
  confirmed: "border-[#c9dce9] bg-[#eff7fc] text-[#376985]",
  completed: "border-[#cfe5d4] bg-[#eff9f0] text-[#397348]",
  cancelled: "border-[#ead4d4] bg-[#fff1f1] text-[#9b4a4a]",
  no_show: "border-[#e4d8ed] bg-[#f7f0fc] text-[#76508c]",
};

function startOfWeek(date: Date) {
  const start = dayStart(date);
  const weekday = start.getUTCDay();
  start.setUTCDate(start.getUTCDate() - weekday);
  return start;
}

function addDays(date: Date, amount: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + amount);
  return result;
}

export default function BookingCalendar({
  bookings,
  clients,
  services,
}: {
  bookings: CalendarBooking[];
  clients: ClientOption[];
  services: ServiceOption[];
}) {
const [selectedDate, setSelectedDate] = useState(() => new Date());
const [view, setView] = useState<ViewMode>("month");
const [selectedBooking, setSelectedBooking] =
  useState<CalendarBooking | null>(null);
const [bookingDateTime, setBookingDateTime] = useState("");
const [statusFilter, setStatusFilter] =
  useState<BookingStatusFilter>("all");

  const todayKey = dateKey(new Date());

  const groupedBookings = useMemo(() => {
    const groups = new Map<string, CalendarBooking[]>();

            for (const booking of bookings) {
            if (statusFilter !== "all" && booking.status !== statusFilter) {
                continue;
            }

            const key = dateKey(new Date(booking.startsAt));
      const current = groups.get(key) ?? [];
      current.push(booking);
      groups.set(key, current);
    }

    for (const entries of groups.values()) {
      entries.sort(
        (a, b) =>
          new Date(a.startsAt).getTime() -
          new Date(b.startsAt).getTime(),
      );
    }

    return groups;
}, [bookings, statusFilter]);

  const monthDays = useMemo(() => {
    const monthStart = dayStart(selectedDate);
    monthStart.setUTCDate(1);

    const firstWeekday = monthStart.getUTCDay();
    monthStart.setUTCDate(monthStart.getUTCDate() - firstWeekday);

    return Array.from({ length: 42 }, (_, index) =>
      addDays(monthStart, index),
    );
  }, [selectedDate]);

  const visibleDays = useMemo(() => {
    if (view === "day") return [dayStart(selectedDate)];

    if (view === "week") {
      const start = startOfWeek(selectedDate);
      return Array.from({ length: 7 }, (_, index) =>
        addDays(start, index),
      );
    }

    return monthDays;
  }, [monthDays, selectedDate, view]);

  function navigate(direction: number) {
    setSelectedDate((current) => {
      const next = dayStart(current);

      if (view === "month") {
        next.setUTCDate(1);
        next.setUTCMonth(next.getUTCMonth() + direction);
      } else {
        next.setUTCDate(
          next.getUTCDate() + direction * (view === "week" ? 7 : 1),
        );
      }

      return next;
    });
  }

  const heading =
    view === "month"
      ? formatMonth(selectedDate)
      : view === "week"
        ? `${formatLongDate(visibleDays[0])} – ${formatLongDate(visibleDays[6])}`
        : formatLongDate(selectedDate);

 function renderBooking(booking: CalendarBooking, compact = false) {
  const status = booking.status.replace("_", " ");

  return (
    <article
      key={booking.id}
      role="button"
      tabIndex={0}
      aria-label={`View appointment for ${booking.clientName}`}
      onClick={(event) => {
        event.stopPropagation();
        setSelectedBooking(booking);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          setSelectedBooking(booking);
        }
      }}
      className={`cursor-pointer rounded-lg border p-2 transition hover:shadow-sm ${statusStyles[booking.status] ?? "border-[#eae4df] bg-[#faf8f5] text-[#514a46]"}`}
    >
      <p className="text-xs font-semibold">
        {formatTime(new Date(booking.startsAt))}
        {compact ? "" : ` – ${formatTime(new Date(booking.endsAt))}`}
      </p>

      <p className="mt-1 text-xs font-medium">{booking.clientName}</p>

      {!compact && (
        <>
          <p className="mt-1 text-xs">{booking.serviceName}</p>
          <p className="mt-1 text-[11px] capitalize opacity-80">{status}</p>
        </>
      )}
    </article>
  );
}

  return (
    <section className="rounded-2xl border border-[#eae4df] bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#a65d69]">
            Schedule
          </p>
          <h2 className="mt-1 text-xl font-semibold text-[#272321]">
            Appointment calendar
          </h2>
        </div>

        <div className="flex rounded-xl border border-[#eae4df] p-1">
          {(["month", "week", "day"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setView(mode)}
              aria-pressed={view === mode}
              className={`rounded-lg px-3 py-2 text-sm capitalize ${
                view === mode
                  ? "bg-[#a65d69] text-white"
                  : "text-[#827873] hover:bg-[#faf8f5]"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
                <div className="mt-5">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-[#827873]">
          Filter appointments
        </p>

        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "All"],
              ["scheduled", "Scheduled"],
              ["confirmed", "Confirmed"],
              ["completed", "Completed"],
              ["cancelled", "Cancelled"],
              ["no_show", "No-show"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setStatusFilter(value);
                setSelectedBooking(null);
              }}
              aria-pressed={statusFilter === value}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                statusFilter === value
                  ? "border-[#a65d69] bg-[#a65d69] text-white"
                  : "border-[#eae4df] bg-white text-[#827873] hover:bg-[#faf8f5]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-[#272321]">
          {heading}
        </h3>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Previous period"
            className="rounded-lg border border-[#eae4df] px-3 py-2 text-sm hover:bg-[#faf8f5]"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => setSelectedDate(new Date())}
            className="rounded-lg border border-[#eae4df] px-3 py-2 text-sm hover:bg-[#faf8f5]"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => navigate(1)}
            aria-label="Next period"
            className="rounded-lg border border-[#eae4df] px-3 py-2 text-sm hover:bg-[#faf8f5]"
          >
            →
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 border-b border-[#eae4df]">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="px-1 py-3 text-center text-xs font-medium text-[#827873]"
          >
            {day}
          </div>
        ))}
      </div>

      {view === "month" ? (
        <div className="grid grid-cols-7">
          {monthDays.map((date) => {
            const key = dateKey(date);
            const isCurrentMonth =
              date.getUTCMonth() === dayStart(selectedDate).getUTCMonth();
            const isToday = key === todayKey;
            const dayBookings = groupedBookings.get(key) ?? [];

            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSelectedDate(date);
                  setView("day");
                }}
                className={`min-h-24 border-b border-r border-[#f0ebe7] p-1 text-left transition hover:bg-[#faf8f5] sm:min-h-32 sm:p-2 ${
                  isCurrentMonth ? "" : "bg-[#faf8f5]/60"
                }`}
              >
                <span
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                    isToday
                      ? "bg-[#a65d69] font-semibold text-white"
                      : isCurrentMonth
                        ? "text-[#272321]"
                        : "text-[#b6aca6]"
                  }`}
                >
                  {date.getUTCDate()}
                </span>

                <div className="mt-1 space-y-1">
                {dayBookings.slice(0, 2).map((booking) =>
                    renderBooking(booking, true),
                )}

                {dayBookings.length > 2 && (
                    <p className="px-1 text-[10px] font-medium text-[#914b57]">
                    +{dayBookings.length - 2} more
                    </p>
                )}

                {key >= todayKey && (
                <span
                    onClick={(event) => {
                    event.stopPropagation();
                    setBookingDateTime(`${key}T09:00`);
                    setSelectedDate(date);
                    setSelectedBooking(null);
                    setView("day");
                    }}
                    className="block cursor-pointer rounded-md px-1 py-1 text-[10px] font-medium text-[#914b57] hover:bg-[#f5e8e9]"
                >
                    + New appointment
                </span>
                )}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 pt-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibleDays.map((date) => {
            const key = dateKey(date);
            const dayBookings = groupedBookings.get(key) ?? [];

            return (
              <div
                key={key}
                className={`rounded-xl border p-3 ${
                  key === todayKey
                    ? "border-[#c9959d] bg-[#fdf7f7]"
                    : "border-[#eae4df]"
                }`}
              >
                <h4 className="mb-3 text-sm font-semibold text-[#272321]">
                  {new Intl.DateTimeFormat("en-NG", {
                    timeZone: TIME_ZONE,
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  }).format(date)}
                </h4>
                {key >= todayKey && (
                <button
                    type="button"
                    onClick={() => {
                    setBookingDateTime(`${key}T09:00`);
                    setSelectedDate(date);
                    setSelectedBooking(null);
                    }}
                    className="mb-3 w-full rounded-lg border border-[#e8cdd1] px-3 py-2 text-xs font-medium text-[#914b57] transition hover:bg-[#fdf7f7]"
                >
                    + New appointment
                </button>
                )}
                {dayBookings.length === 0 ? (
                  <p className="text-xs text-[#a19791]">No appointments</p>
                ) : (
                  <div className="space-y-2">
                    {dayBookings.map((booking) => renderBooking(booking))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    {bookingDateTime && (
  <div className="mt-5 rounded-2xl border border-[#e8cdd1] bg-[#fdf7f7] p-5">
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#a65d69]">
          New appointment
        </p>
        <h3 className="mt-1 text-lg font-semibold text-[#272321]">
          Schedule a makeup session
        </h3>
      </div>

            <button
                type="button"
                onClick={() => setBookingDateTime("")}
                className="rounded-lg border border-[#eae4df] bg-white px-3 py-2 text-sm hover:bg-[#faf8f5]"
            >
                Close
            </button>
            </div>

            <BookingForm
            clients={clients}
            services={services}
            initialDateTime={bookingDateTime}
            />
        </div>
        )}
    {selectedBooking && (
  <div className="mt-5 rounded-2xl border border-[#e8cdd1] bg-[#fdf7f7] p-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#a65d69]">
          Appointment details
        </p>
        <h3 className="mt-1 text-lg font-semibold text-[#272321]">
          {selectedBooking.clientName}
        </h3>
        <p className="mt-1 text-sm text-[#827873]">
          {selectedBooking.serviceName}
        </p>
      </div>

      <button
        type="button"
        onClick={() => setSelectedBooking(null)}
        className="rounded-lg border border-[#eae4df] bg-white px-3 py-2 text-sm text-[#514a46] hover:bg-[#faf8f5]"
      >
        Close
      </button>
    </div>

    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <p className="text-xs text-[#827873]">Date</p>
        <p className="mt-1 text-sm font-medium text-[#272321]">
          {formatLongDate(new Date(selectedBooking.startsAt))}
        </p>
      </div>

      <div>
        <p className="text-xs text-[#827873]">Time</p>
        <p className="mt-1 text-sm font-medium text-[#272321]">
          {formatTime(new Date(selectedBooking.startsAt))} –{" "}
          {formatTime(new Date(selectedBooking.endsAt))}
        </p>
      </div>

      <div>
        <p className="text-xs text-[#827873]">Price</p>
        <p className="mt-1 text-sm font-medium text-[#272321]">
          ₦{(selectedBooking.priceKobo / 100).toLocaleString("en-NG", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>

        <div>
        <p className="text-xs text-[#827873]">Status</p>

        <span
            className={`mt-1 inline-flex rounded-full border px-3 py-1 text-xs capitalize ${
            statusStyles[selectedBooking.status] ??
            "border-[#eae4df] bg-white text-[#514a46]"
            }`}
        >
            {selectedBooking.status.replace("_", " ")}
        </span>

        <div className="mt-3">
            <BookingStatusControl
            bookingId={selectedBooking.id}
            status={
                selectedBooking.status as
                | "scheduled"
                | "confirmed"
                | "completed"
                | "cancelled"
                | "no_show"
            }
            />
        </div>
        </div>
            </div>
            {!["completed", "cancelled", "no_show"].includes(
        selectedBooking.status,
        ) && (
        <div className="mt-5 border-t border-[#e8cdd1] pt-4">
            <p className="mb-2 text-xs text-[#827873]">
            Need to cancel this appointment?
            </p>

            <CancelBookingButton bookingId={selectedBooking.id} />
        </div>
        )}
        </div>
        )}

      <div className="mt-5 flex flex-wrap gap-3 border-t border-[#f0ebe7] pt-4">
        {Object.entries(statusStyles).map(([status, style]) => (
          <div key={status} className="flex items-center gap-2 text-xs capitalize text-[#827873]">
            <span className={`h-3 w-3 rounded-sm border ${style}`} />
            {status.replace("_", " ")}
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-[#827873]">
        Times are shown in Lagos time. Select a date in month view to open its day schedule.
      </p>
    </section>
  );
}