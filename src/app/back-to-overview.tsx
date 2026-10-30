import Link from "next/link";

export default function BackToOverview() {
  return (
    <Link
      href="/"
      className="mb-6 inline-flex items-center gap-2 rounded-xl border border-[#eae4df] bg-white px-4 py-2.5 text-sm font-medium text-[#716964] transition hover:bg-[#f5e8e9] hover:text-[#914b57]"
    >
      <span aria-hidden="true">←</span>
      Back to overview
    </Link>
  );
}
