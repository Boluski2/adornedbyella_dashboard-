"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { updateService, type ServiceActionState } from "./actions";

type ServiceData = {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  priceKobo: number;
};

const initialState: ServiceActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-[#a65d69] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#914b57] disabled:opacity-60"
    >
      {pending ? "Saving..." : "Save changes"}
    </button>
  );
}

export default function ServiceEditForm({
  service,
}: {
  service: ServiceData;
}) {
  const [state, formAction] = useActionState(updateService, initialState);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (state.success) {
      window.location.reload();
    }
  }, [state.success]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="rounded-xl border border-[#eae4df] px-4 py-2 text-sm font-medium text-[#914b57] hover:bg-[#faf8f5]"
      >
        {open ? "Close editor" : "Edit service"}
      </button>

      {open && (
        <form action={formAction} className="mt-4 space-y-4 border-t border-[#f0ebe7] pt-4">
          <input type="hidden" name="serviceId" value={service.id} />

          <div>
            <label htmlFor={`edit-name-${service.id}`} className="mb-1.5 block text-sm font-medium">
              Service name
            </label>
            <input
              id={`edit-name-${service.id}`}
              name="name"
              required
              minLength={2}
              maxLength={100}
              defaultValue={service.name}
              className="w-full rounded-xl border border-[#eae4df] px-3 py-2.5 text-sm outline-none focus:border-[#a65d69]"
            />
          </div>

          <div>
            <label htmlFor={`edit-description-${service.id}`} className="mb-1.5 block text-sm font-medium">
              Description
            </label>
            <textarea
              id={`edit-description-${service.id}`}
              name="description"
              rows={2}
              maxLength={1000}
              defaultValue={service.description ?? ""}
              className="w-full rounded-xl border border-[#eae4df] px-3 py-2.5 text-sm outline-none focus:border-[#a65d69]"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor={`edit-duration-${service.id}`} className="mb-1.5 block text-sm font-medium">
                Duration (minutes)
              </label>
              <input
                id={`edit-duration-${service.id}`}
                name="durationMinutes"
                type="number"
                required
                min={5}
                max={1440}
                step={5}
                defaultValue={service.durationMinutes}
                className="w-full rounded-xl border border-[#eae4df] px-3 py-2.5 text-sm outline-none focus:border-[#a65d69]"
              />
            </div>

            <div>
              <label htmlFor={`edit-price-${service.id}`} className="mb-1.5 block text-sm font-medium">
                Price (₦)
              </label>
              <input
                id={`edit-price-${service.id}`}
                name="priceNaira"
                type="number"
                required
                min={0}
                max={100000000}
                step="0.01"
                defaultValue={(service.priceKobo / 100).toFixed(2)}
                className="w-full min-w-0 rounded-xl border border-[#eae4df] px-3 py-2.5 text-sm outline-none focus:border-[#a65d69]"
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
      )}
    </div>
  );
}
