export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf8f5] px-5 text-[#827873]">
      <div className="flex items-center gap-3 rounded-2xl border border-[#eae4df] bg-white px-5 py-4 shadow-sm">
        <span
          aria-hidden="true"
          className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#a65d69]"
        />
        <p role="status" className="text-sm">
          Loading your workspace...
        </p>
      </div>
    </main>
  );
}
