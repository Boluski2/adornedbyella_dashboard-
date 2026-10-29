
"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  createBooking,
  type BookingActionState,
} from "./actions";

type ClientOption = {
  id: string;
  name: string;
};

type ServiceOption = {
  id: string;
  name: string;
  durationMinutes: number;
  priceKobo: number;
};

const initialState: BookingActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-[#a65d69] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#8f4b57] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saving booking..." : "Create booking"}
    </button>
  );
}

export default function BookingForm({
  clients,
  services,
}: {
  clients: ClientOption[];
  services: ServiceOption[];
}) {
  const [state, formAction] = useActionState(
    createBooking,
    initialState,
  );
  const [startsAtLocal, setStartsAtLocal] = useState("");

  useEffect(() => {
    if (state.success) {
      window.location.reload();
    }
  }, [state.success]);

  const formatPrice = (priceKobo: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 2,
    }).format(priceKobo / 100);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label
          htmlFor="clientId"
          className="mb-2 block text-sm font-medium text-[#272321]"
        >
          Client
        </label>
        <select
          id="clientId"
          name="clientId"
          required
          defaultValue=""
          className="w-full rounded-xl border border-[#eae4df] bg-white px-4 py-3 text-sm outline-none focus:border-[#a65d69]"
        >
          <option value="" disabled>
            Select a client
          </option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
        {clients.length === 0 && (
          <p className="mt-2 text-xs text-[#827873]">
            Add a client on the Clients page before creating a booking.
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="serviceId"
          className="mb-2 block text-sm font-medium text-[#272321]"
        >
          Makeup service
        </label>
        <select
          id="serviceId"
          name="serviceId"
          required
          defaultValue=""
          className="w-full rounded-xl border border-[#eae4df] bg-white px-4 py-3 text-sm outline-none focus:border-[#a65d69]"
        >
          <option value="" disabled>
            Select a service
          </option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} · {service.durationMinutes} min ·{" "}
              {formatPrice(service.priceKobo)}
            </option>
          ))}
        </select>
        {services.length === 0 && (
          <p className="mt-2 text-xs text-[#827873]">
            Add an active service on the Services page before booking.
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="startsAtLocal"
          className="mb-2 block text-sm font-medium text-[#272321]"
        >
          Appointment date and time
        </label>
        <input
          id="startsAtLocal"
          name="startsAtLocal"
          type="datetime-local"
          required
          value={startsAtLocal}
          onChange={(event) => setStartsAtLocal(event.target.value)}
          className="w-full rounded-xl border border-[#eae4df] bg-white px-4 py-3 text-sm outline-none focus:border-[#a65d69]"
        />
        <input
          type="hidden"
          name="startsAt"
          value={
            startsAtLocal
              ? new Date(startsAtLocal).toISOString()
              : ""
          }
        />
        <p className="mt-2 text-xs text-[#827873]">
          The appointment end time will be calculated from the service duration.
        </p>
      </div>

      <div>
        <label
          htmlFor="notes"
          className="mb-2 block text-sm font-medium text-[#272321]"
        >
          Notes <span className="font-normal text-[#827873]">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          maxLength={2000}
          placeholder="Add appointment details or client preferences..."
          className="w-full rounded-xl border border-[#eae4df] bg-white px-4 py-3 text-sm outline-none focus:border-[#a65d69]"
        />
      </div>

      {state.error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
