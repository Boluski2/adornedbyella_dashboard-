
"use client";

import { useState } from "react";
import { deleteClient } from "./actions";

type ClientDeleteButtonProps = {
  clientId: string;
  clientName: string;
};

export default function ClientDeleteButton({
  clientId,
  clientName,
}: ClientDeleteButtonProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${clientName}? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setPending(true);
    setError("");

    try {
      const result = await deleteClient(clientId);

      if (result.error) {
        setError(result.error);
        return;
      }

      window.location.reload();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
      >
        {pending ? "Deleting..." : "Delete"}
      </button>

      {error && (
        <p role="alert" className="max-w-xs text-xs leading-5 text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
