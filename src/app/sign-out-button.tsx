
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth";

export default function SignOutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignOut() {
    setLoading(true);
    setError("");

    try {
      const result = await authClient.signOut();

      if (result.error) {
        setError(result.error.message || "Unable to sign out.");
        return;
      }

      router.replace("/sign-in");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleSignOut}
        disabled={loading}
        aria-label={compact ? "Sign out" : undefined}
        title={compact ? "Sign out" : undefined}
        className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-[#716964] transition hover:bg-[#f5e8e9] hover:text-[#914b57] disabled:opacity-60 ${compact ? "justify-center px-2" : ""}`}
      >
        <span aria-hidden="true">↪</span>
        {!compact && (loading ? "Signing out..." : "Sign out")}
      </button>

      {error && (
        <p role="alert" className="mt-2 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
