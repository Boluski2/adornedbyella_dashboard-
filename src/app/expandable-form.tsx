"use client";

import { useState, type ReactNode } from "react";

export default function ExpandableForm({
  id,
  buttonLabel,
  title,
  description,
  children,
}: {
  id: string;
  buttonLabel: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section id={id} className="rounded-2xl border border-[#eae4df] bg-white p-5 shadow-sm sm:p-6">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-form`}
        onClick={() => setOpen((value) => !value)}
        className="rounded-xl bg-[#a65d69] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#914b57] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#914b57]"
      >
        {open ? `Close ${buttonLabel.toLowerCase()}` : `+ ${buttonLabel}`}
      </button>

      {open && (
        <div id={`${id}-form`} className="mt-6 border-t border-[#f0ebe7] pt-5">
          <h2 className="text-xl font-semibold text-[#272321]">{title}</h2>
          <p className="mb-6 mt-1 text-sm text-[#827873]">{description}</p>
          {children}
        </div>
      )}
    </section>
  );
}
