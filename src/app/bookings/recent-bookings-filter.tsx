
"use client";

import { useState } from "react";
import CancelBookingButton from "./cancel-booking-button";
import BookingStatusControl from "./booking-status-control";

type BookingStatus =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

type RecentBooking = {
  id: string;
  clientName: string;
  serviceName: string;
  startsAt: string;
  priceKobo: number;
  status: BookingStatus;
};

type Props = {
  bookings: RecentBooking[];
};

const filters = [
  { value: "all", label: "All" },
  { value: "scheduled", label: "Scheduled" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No-show" },
] as const;

export default function RecentBookingsFilter({ bookings }: Props)  {
      const formatPrice = (priceKobo: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 2,
    }).format(priceKobo / 100);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Africa/Lagos",
    }).format(date);

const [statusFilter, setStatusFilter] = useState<
  "all" | BookingStatus
>("all");

const [searchTerm, setSearchTerm] = useState("");
const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");
const clearFilters = () => {
  setSearchTerm("");
  setStartDate("");
  setEndDate("");
  setStatusFilter("all");
};

  const recentBookings = bookings.slice(0, 20);

const filteredBookings = recentBookings.filter((booking) => {
  const matchesStatus =
    statusFilter === "all" || booking.status === statusFilter;

  const search = searchTerm.trim().toLowerCase();

  const matchesSearch =
    booking.clientName.toLowerCase().includes(search) ||
    booking.serviceName.toLowerCase().includes(search);

  const bookingDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(booking.startsAt));

  const matchesStartDate =
    !startDate || bookingDate >= startDate;

  const matchesEndDate =
    !endDate || bookingDate <= endDate;

  return (
    matchesStatus &&
    matchesSearch &&
    matchesStartDate &&
    matchesEndDate
  );
});

  return (
    <>
            <div className="mb-4 space-y-4">
            <div>
                <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by client name or service..."
                className="w-full max-w-md rounded-xl border border-[#eae4df] bg-white px-4 py-3 text-sm text-[#272321] outline-none transition placeholder:text-[#a49a94] focus:border-[#a65d69] focus:ring-2 focus:ring-[#a65d69]/10"
                />
            </div>

            <div className="flex flex-wrap gap-3">
  <div>
    <label
      htmlFor="booking-start-date"
      className="mb-1 block text-xs font-medium text-[#827873]"
    >
      From
    </label>
    <input
      id="booking-start-date"
      type="date"
      value={startDate}
      onChange={(event) => setStartDate(event.target.value)}
      className="rounded-xl border border-[#eae4df] bg-white px-3 py-2 text-sm text-[#272321] outline-none focus:border-[#a65d69]"
    />
  </div>

        <div>
            <label
            htmlFor="booking-end-date"
            className="mb-1 block text-xs font-medium text-[#827873]"
            >
            To
            </label>
            <input
            id="booking-end-date"
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(event) => setEndDate(event.target.value)}
            className="rounded-xl border border-[#eae4df] bg-white px-3 py-2 text-sm text-[#272321] outline-none focus:border-[#a65d69]"
            />
        </div>
        </div>

            <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatusFilter(filter.value)}
              aria-pressed={statusFilter === filter.value}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                statusFilter === filter.value
                  ? "border-[#a65d69] bg-[#a65d69] text-white"
                  : "border-[#eae4df] bg-white text-[#827873] hover:bg-[#faf8f5]"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

            <button
            type="button"
            onClick={clearFilters}
            className="rounded-full border border-[#eae4df] bg-white px-3 py-1.5 text-xs font-medium text-[#827873] transition hover:bg-[#faf8f5] hover:text-[#a65d69]"
            >
            Clear filters
            </button>

        <p className="mt-3 text-xs text-[#827873]">
          Showing {filteredBookings.length} of {recentBookings.length} recent bookings.
        </p>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#eae4df] px-6 py-10 text-center">
          <p className="font-medium text-[#272321]">
            No bookings found
          </p>
          <p className="mt-2 text-sm text-[#827873]">
            There are no recent bookings with this status.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#eae4df] text-[#827873]">
                <th className="px-3 py-3 font-medium">Client</th>
                <th className="px-3 py-3 font-medium">Service</th>
                <th className="px-3 py-3 font-medium">Date &amp; time</th>
                <th className="px-3 py-3 font-medium">Price</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Actions</th>
                <th className="px-3 py-3 font-medium">Manage status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-b border-[#f2eeea] last:border-0"
                >
                  <td className="px-3 py-4 font-medium text-[#272321]">
                    {booking.clientName}
                  </td>
                  <td className="px-3 py-4 text-[#514a46]">
                    {booking.serviceName}
                  </td>
                  <td className="px-3 py-4 text-[#514a46]">
                    {formatDate(new Date(booking.startsAt))}
                  </td>
                  <td className="px-3 py-4 text-[#514a46]">
                    {formatPrice(booking.priceKobo)}
                  </td>
                  <td className="px-3 py-4">
                    <span className="rounded-full bg-[#f5e8e9] px-3 py-1 text-xs font-medium capitalize text-[#8f4b57]">
                      {booking.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    {booking.status !== "cancelled" &&
                      booking.status !== "completed" &&
                      booking.status !== "no_show" && (
                        <CancelBookingButton bookingId={booking.id} />
                      )}
                  </td>
                  <td className="px-3 py-4">
                    <BookingStatusControl
                      bookingId={booking.id}
                      status={booking.status}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
