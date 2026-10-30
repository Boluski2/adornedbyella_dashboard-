"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf8f5] px-4 py-8 text-[#272321] sm:px-6">
      <section className="w-full max-w-lg rounded-3xl border border-[#eae4df] bg-white p-6 text-center shadow-sm sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#a65d69]">
          AdornedByElla
        </p>
        <h1 className="mt-6 text-xl font-semibold sm:text-2xl">
          Something went wrong
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#827873]">
          Try loading the page again in a moment.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-7 inline-flex max-w-full justify-center rounded-xl bg-[#a65d69] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#914b57]"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
