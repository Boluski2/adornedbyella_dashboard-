"use client";

import { useState } from "react";
import BookingForm from "./bookings/booking-form";
import ServiceForm from "./services/service-form";

type ClientOption = { id: string; name: string };
type ServiceOption = {
  id: string;
  name: string;
  durationMinutes: number;
  priceKobo: number;
};

export default function OverviewCreateActions({
  clients,
  services,
}: {
  clients: ClientOption[];
  services: ServiceOption[];
}) {
  const [form, setForm] = useState<"booking" | "service" | null>(null);

  return (
    <section aria-label="Create records" className="mt-6">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          aria-expanded={form === "booking"}
          onClick={() => setForm((current) => current === "booking" ? null : "booking")}
          className="rounded-xl bg-[#a65d69] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#914b57]"
        >
          {form === "booking" ? "Close booking form" : "+ Add booking"}
        </button>
        <button
          type="button"
          aria-expanded={form === "service"}
          onClick={() => setForm((current) => current === "service" ? null : "service")}
          className="rounded-xl border border-[#eae4df] bg-white px-5 py-3 text-sm font-medium text-[#914b57] transition hover:bg-[#f5e8e9]"
        >
          {form === "service" ? "Close service form" : "+ Add service"}
        </button>
      </div>

      {form === "booking" && (
        <div className="mt-4 rounded-2xl border border-[#eae4df] bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-semibold">Create a booking</h2>
          <p className="mb-6 mt-1 text-sm text-[#827873]">
            Choose a client, service, and appointment time.
          </p>
          <BookingForm clients={clients} services={services} />
        </div>
      )}

      {form === "service" && (
        <div className="mt-4 rounded-2xl border border-[#eae4df] bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-semibold">Add a service</h2>
          <p className="mb-6 mt-1 text-sm text-[#827873]">
            Set the price and time needed for each appointment.
          </p>
          <ServiceForm />
        </div>
      )}
    </section>
  );
}
