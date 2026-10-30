"use client";

import Link from "next/link";

export function NewBookingButton() {
  return (
    <Link
      href="/bookings#new-booking"
      className="rounded-xl bg-[#a65d69] px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#914b57]"
    >
      + New booking
    </Link>
  );
}

export function ViewAllButton() {
  return (
    <Link
      href="/bookings"
      className="rounded-lg border border-[#eae4df] px-3 py-2 text-sm text-[#716964] hover:bg-[#faf8f5]"
    >
      View all
    </Link>
  );
}
