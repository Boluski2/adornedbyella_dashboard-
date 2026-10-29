
"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { createClient, type CreateClientState } from "./actions";

const initialState: CreateClientState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-[#a65d69] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#914b57] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saving client..." : "Save client"}
    </button>
  );
}

export default function ClientForm() {
  const [state, formAction] = useActionState(createClient, initialState);

  useEffect(() => {
    if (state.success) {
      window.location.reload();
    }
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium">
          Full name <span className="text-[#a65d69]">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={100}
          autoComplete="name"
          placeholder="Enter client's full name"
          className="w-full rounded-xl border border-[#eae4df] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#a65d69] focus:ring-2 focus:ring-[#f5e8e9]"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            maxLength={254}
            autoComplete="email"
            placeholder="client@example.com"
            className="w-full rounded-xl border border-[#eae4df] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#a65d69] focus:ring-2 focus:ring-[#f5e8e9]"
          />
        </div>

        <div>
          <label htmlFor="phone" className="mb-2 block text-sm font-medium">
            Phone number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            maxLength={30}
            autoComplete="tel"
            placeholder="Client's phone number"
            className="w-full rounded-xl border border-[#eae4df] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#a65d69] focus:ring-2 focus:ring-[#f5e8e9]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="mb-2 block text-sm font-medium">
          Notes <span className="font-normal text-[#827873]">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          maxLength={2000}
          placeholder="Preferences or other useful details..."
          className="w-full resize-y rounded-xl border border-[#eae4df] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#a65d69] focus:ring-2 focus:ring-[#f5e8e9]"
        />
      </div>

      {state.error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eae4df] pt-5">
        <p className="text-xs text-[#827873]">
          Fields marked with * are required.
        </p>
        <SubmitButton />
      </div>
    </form>
  );
}
