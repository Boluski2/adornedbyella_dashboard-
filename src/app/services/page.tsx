
import { headers } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";

import { auth } from "@/lib/db/auth";
import { db } from "@/lib/db";
import { services } from "@/lib/db/app-schema";
import ServiceForm from "./service-form";
import ServiceEditForm from "./service-edit-form";
import ServiceStatusButton from "./service-status-button";

export default async function ServicesPage() {
  await connection();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const serviceRecords = await db
    .select({
      id: services.id,
      name: services.name,
      description: services.description,
      durationMinutes: services.durationMinutes,
      priceKobo: services.priceKobo,
      isActive: services.isActive,
      createdAt: services.createdAt,
    })
    .from(services)
    .where(eq(services.ownerId, session.user.id))
    .orderBy(desc(services.createdAt));

  const formatNaira = (priceKobo: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 2,
    }).format(priceKobo / 100);

  return (
    <main className="min-h-screen bg-[#faf8f5] px-5 py-10 text-[#272321] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <a href="/" className="text-sm text-[#914b57] hover:underline">
          ← Back to dashboard
        </a>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#a65d69]">YOUR BUSINESS</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Services
            </h1>
            <p className="mt-2 text-sm text-[#827873]">
              Manage your beauty services, prices, and appointment durations.
            </p>
          </div>

          <p className="rounded-full bg-[#f5e8e9] px-4 py-2 text-sm font-medium text-[#914b57]">
            {serviceRecords.length}{" "}
            {serviceRecords.length === 1 ? "service" : "services"}
          </p>
        </div>

        <section className="mt-8 rounded-2xl border border-[#eae4df] bg-white p-6 sm:p-8">
          <div className="mb-6">
            <p className="text-sm font-medium text-[#a65d69]">SERVICE MENU</p>
            <h2 className="mt-2 text-xl font-semibold">Add a service</h2>
            <p className="mt-2 text-sm text-[#827873]">
              Set the price and time needed for each appointment.
            </p>
          </div>

          <ServiceForm />
        </section>

        <section className="mt-8">
          <h2 className="mb-4 text-xl font-semibold">Your services</h2>

          {serviceRecords.length === 0 ? (
            <div className="rounded-2xl border border-[#eae4df] bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5e8e9] text-2xl text-[#914b57]">
                ✦
              </div>
              <h3 className="mt-5 text-lg font-semibold">No services yet</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#827873]">
                Add your first beauty service above. It will be available to use
                when we build appointment booking.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {serviceRecords.map((service) => (
                <article
                  key={service.id}
                  className="rounded-2xl border border-[#eae4df] bg-white p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold">{service.name}</h3>
                    <span className="rounded-full bg-[#f5e8e9] px-3 py-1 text-xs font-medium text-[#914b57]">
                      {service.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {service.description && (
                    <p className="mt-3 text-sm leading-6 text-[#827873]">
                      {service.description}
                    </p>
                  )}

                  <div className="mt-6 flex items-end justify-between border-t border-[#f0ebe7] pt-4">
                    <div>
                      <p className="text-xs text-[#827873]">Duration</p>
                      <p className="mt-1 text-sm font-medium">
                        {service.durationMinutes} minutes
                      </p>
                    </div>
                    <p className="text-lg font-semibold text-[#914b57]">
                      {formatNaira(service.priceKobo)}
                    </p>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2 border-t border-[#f0ebe7] pt-4">
                <ServiceEditForm service={service} />
                <ServiceStatusButton
                    serviceId={service.id}
                    isActive={service.isActive}
                />
                </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
