
"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { createService, type ServiceActionState } from "./actions";

const initialState: ServiceActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-[#a65d69] px-5 py-3 text-sm font-medium text-white hover:bg-[#914b57] disabled:opacity-60"
    >
      {pending ? "Saving service..." : "Save service"}
    </button>
  );
}

export default function ServiceForm() {
  const [state, formAction] = useActionState(createService, initialState);

  useEffect(() => {
    if (state.success) {
      window.location.reload();
    }
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="service-name" className="mb-1.5 block text-sm font-medium">
          Service name
        </label>
        <input
          id="service-name"
          name="name"
          required
          minLength={2}
          maxLength={100}
          placeholder="e.g. Soft Glam"
          className="w-full rounded-xl border border-[#eae4df] bg-white px-4 py-3 text-sm outline-none focus:border-[#a65d69]"
        />
      </div>

      <div>
        <label htmlFor="service-description" className="mb-1.5 block text-sm font-medium">
          Description <span className="font-normal text-[#827873]">(optional)</span>
        </label>
        <textarea
          id="service-description"
          name="description"
          rows={3}
          maxLength={1000}
          placeholder="What does this service include?"
          className="w-full rounded-xl border border-[#eae4df] bg-white px-4 py-3 text-sm outline-none focus:border-[#a65d69]"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="service-duration" className="mb-1.5 block text-sm font-medium">
            Duration (minutes)
          </label>
          <input
            id="service-duration"
            name="durationMinutes"
            type="number"
            required
            min={5}
            max={1440}
            step={5}
            defaultValue={60}
            className="w-full rounded-xl border border-[#eae4df] bg-white px-4 py-3 text-sm outline-none focus:border-[#a65d69]"
          />
        </div>

        <div>
          <label htmlFor="service-price" className="mb-1.5 block text-sm font-medium">
            Price (₦)
          </label>
          <input
            id="service-price"
            name="priceNaira"
            type="number"
            required
            min={0}
            max={100000000}
            step="0.01"
            placeholder="e.g. 25000"
            className="w-full rounded-xl border border-[#eae4df] bg-white px-4 py-3 text-sm outline-none focus:border-[#a65d69]"
          />
        </div>
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
