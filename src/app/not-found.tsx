import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf8f5] px-4 py-8 text-[#272321] sm:px-6">
      <section className="w-full max-w-lg rounded-3xl border border-[#eae4df] bg-white p-6 text-center shadow-sm sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#a65d69]">
          AdornedByElla
        </p>
        <p className="mt-6 text-5xl font-semibold tracking-tight sm:text-6xl">404</p>
        <h1 className="mt-3 text-xl font-semibold sm:text-2xl">Page not found</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#827873]">
          This page may have moved, or the address may be incorrect.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex max-w-full justify-center rounded-xl bg-[#a65d69] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#914b57]"
        >
          Back to overview
        </Link>
      </section>
    </main>
  );
}
