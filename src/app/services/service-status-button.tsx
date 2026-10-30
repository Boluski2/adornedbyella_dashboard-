"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleServiceActive } from "./actions";

export default function ServiceStatusButton({
  serviceId,
  isActive,
}: {
  serviceId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleToggle() {
    const nextAction = isActive ? "deactivate" : "reactivate";

    if (
      !window.confirm(
        `Are you sure you want to ${nextAction} this service?`,
      )
    ) {
      return;
    }

    setError("");

    startTransition(async () => {
      const result = await toggleServiceActive(serviceId);

      if (result.error) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleToggle}
        disabled={pending}
        className={`rounded-xl border px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
          isActive
            ? "border-red-200 text-red-700 hover:bg-red-50"
            : "border-green-200 text-green-700 hover:bg-green-50"
        }`}
      >
        {pending
          ? "Updating..."
          : isActive
            ? "Deactivate"
            : "Reactivate"}
      </button>

      {error && (
        <p role="alert" className="mt-2 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}