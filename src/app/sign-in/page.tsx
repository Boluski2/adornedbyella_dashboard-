
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth";

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
        callbackURL: "/",
      });

      if (result.error) {
        setError(result.error.message || "Unable to sign in.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf8f5] px-5 py-12 text-[#272321]">
      <section className="w-full max-w-md rounded-3xl border border-[#eae4df] bg-white p-7 shadow-sm sm:p-9">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#a65d69] text-xl text-white">
            G
          </span>
          <span className="text-xl font-semibold tracking-tight">
            GlamTrack
          </span>
        </Link>

        <p className="mt-9 text-sm font-medium text-[#a65d69]">
          WELCOME BACK
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Sign in to GlamTrack
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#827873]">
          Continue managing your clients, appointments, and beauty services.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-[#eae4df] px-4 py-3 text-sm outline-none transition focus:border-[#a65d69] focus:ring-2 focus:ring-[#f5e8e9]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-[#eae4df] px-4 py-3 text-sm outline-none transition focus:border-[#a65d69] focus:ring-2 focus:ring-[#f5e8e9]"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#a65d69] px-4 py-3 font-medium text-white transition hover:bg-[#914b57] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#827873]">
          New to GlamTrack?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-[#914b57] hover:underline"
          >
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
