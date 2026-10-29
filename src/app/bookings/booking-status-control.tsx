
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { updateBookingStatus } from "./actions";

type BookingStatus =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

type UpdatableStatus = "confirmed" | "completed" | "no_show";

const nextStatuses: Record<BookingStatus, UpdatableStatus[]> = {
  scheduled: ["confirmed"],
  confirmed: ["completed", "no_show"],
  completed: [],
  cancelled: [],
  no_show: [],
};

export default function BookingStatusControl({
  bookingId,
  status,
}: {
  bookingId: string;
  status: BookingStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const allowedStatuses = nextStatuses[status];

  if (allowedStatuses.length === 0) {
    return (
      <span className="text-xs text-[#827873]">
        Status locked
      </span>
    );
  }

  function handleChange(nextStatus: string) {
    if (
      !allowedStatuses.includes(nextStatus as UpdatableStatus)
    ) {
      return;
    }

    if (nextStatus === status) return;

    const label = nextStatus.replace("_", " ");

    if (
      !window.confirm(
        `Change this booking status to "${label}"?`,
      )
    ) {
      return;
    }

    setError("");

    startTransition(async () => {
      const result = await updateBookingStatus(
        bookingId,
        nextStatus as UpdatableStatus,
      );

      if (result.error) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <select
        aria-label="Update booking status"
        value={status}
        disabled={pending}
        onChange={(event) => handleChange(event.target.value)}
        className="rounded-lg border border-[#eae4df] bg-white px-3 py-2 text-xs capitalize text-[#272321] outline-none focus:border-[#a65d69] disabled:opacity-60"
      >
        <option value={status} disabled>
          {status.replace("_", " ")}
        </option>

        {allowedStatuses.map((nextStatus) => (
          <option key={nextStatus} value={nextStatus}>
            {nextStatus.replace("_", " ")}
          </option>
        ))}
      </select>

      {pending && (
        <p className="text-xs text-[#827873]">
          Updating status...
        </p>
      )}

      {error && (
        <p role="alert" className="max-w-48 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
