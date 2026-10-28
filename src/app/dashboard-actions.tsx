"use client";

export function NewBookingButton() {
  return (
    <button
      type="button"
      onClick={() => {
        document.getElementById("appointments")?.scrollIntoView({
          behavior: "smooth",
        });
      }}
      className="rounded-xl bg-[#a65d69] px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#914b57]"
    >
      + New booking
    </button>
  );
}

export function ViewAllButton() {
  return (
    <button
      type="button"
      className="rounded-lg border border-[#eae4df] px-3 py-2 text-sm text-[#716964] hover:bg-[#faf8f5]"
      onClick={() => {
        alert("Booking management will be added in a later step.");
      }}
    >
      View all
    </button>
  );
}
