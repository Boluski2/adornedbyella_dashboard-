
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { cancelBooking } from "./actions";

export default function CancelBookingButton({
  bookingId,
}: {
  bookingId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleCancel() {
    const confirmed = window.confirm(
      "Cancel this appointment? Its time slot will become available again.",
    );

    if (!confirmed) return;

    setError("");

    startTransition(async () => {
      const result = await cancelBooking(bookingId);

      if (result.error) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleCancel}
        disabled={pending}
        className="rounded-lg border border-[#eae4df] px-3 py-2 text-xs font-medium text-[#8f4b57] transition hover:bg-[#f5e8e9] disabled:opacity-60"
      >
        {pending ? "Cancelling..." : "Cancel booking"}
      </button>

      {error && (
        <p role="alert" className="max-w-48 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
