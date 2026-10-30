
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth";

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <main className="flex min-h-screen items-center justify-center bg-[#faf8f5] px-4 py-8 text-[#272321] sm:px-6 sm:py-12">
      <section className="w-full max-w-md rounded-3xl border border-[#eae4df] bg-white p-5 shadow-sm sm:p-8 lg:p-9">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#a65d69] text-xl text-white">
            G
          </span>
          <span className="text-xl font-semibold tracking-tight">
            Inventory Dashboard
          </span>
        </Link>

        <p className="mt-7 text-sm font-medium text-[#a65d69] sm:mt-9">
          WELCOME BACK
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          Sign in to Inventory Dashboard
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
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-[#eae4df] px-4 py-3 pr-12 text-sm outline-none transition focus:border-[#a65d69] focus:ring-2 focus:ring-[#f5e8e9]"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-[#827873] transition hover:text-[#914b57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#a65d69]"
              >
                {showPassword ? (
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.9 5.2A10.8 10.8 0 0112 5c5.2 0 8.5 4.4 9.5 6.2a1.5 1.5 0 010 1.6 16 16 0 01-3.2 3.7M6.2 6.2A16 16 0 002.5 11.2a1.5 1.5 0 000 1.6C3.5 14.6 6.8 19 12 19c1.2 0 2.3-.3 3.3-.7" />
                  </svg>
                ) : (
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12s3.3-7 9.5-7 9.5 7 9.5 7-3.3 7-9.5 7-9.5-7-9.5-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
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
          New to Inventory Dashboard?{" "}
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
