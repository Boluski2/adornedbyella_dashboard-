
import { asc, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { auth } from "@/lib/db/auth";
import { db } from "@/lib/db";
import { bookings, clients, services } from "@/lib/db/app-schema";
import BookingForm from "./booking-form";
import CancelBookingButton from "./cancel-booking-button";
import BookingStatusControl from "./booking-status-control";

export default async function BookingsPage() {
  await connection();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const ownerId = session.user.id;

  const [clientOptions, serviceOptions, bookingRows] = await Promise.all([
    db
      .select({
        id: clients.id,
        name: clients.name,
      })
      .from(clients)
      .where(eq(clients.ownerId, ownerId))
      .orderBy(asc(clients.name)),

    db
      .select({
        id: services.id,
        name: services.name,
        durationMinutes: services.durationMinutes,
        priceKobo: services.priceKobo,
      })
      .from(services)
      .where(eq(services.ownerId, ownerId))
      .orderBy(asc(services.name)),

    db
      .select({
        id: bookings.id,
        startsAt: bookings.startsAt,
        endsAt: bookings.endsAt,
        status: bookings.status,
        priceKobo: bookings.priceKobo,
        clientName: clients.name,
        serviceName: services.name,
      })
      .from(bookings)
      .innerJoin(clients, eq(bookings.clientId, clients.id))
      .innerJoin(services, eq(bookings.serviceId, services.id))
      .where(eq(bookings.ownerId, ownerId))
      .orderBy(desc(bookings.startsAt))
      .limit(20),
  ]);

  const formatPrice = (priceKobo: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 2,
    }).format(priceKobo / 100);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6 md:p-10">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#a65d69]">
          Appointment management
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#272321]">
          Bookings
        </h1>
        <p className="mt-2 text-sm text-[#827873]">
          Schedule makeup appointments and keep track of upcoming clients.
        </p>
      </header>

      <section className="rounded-2xl border border-[#eae4df] bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-[#272321]">
          Create a booking
        </h2>
        <p className="mt-1 mb-6 text-sm text-[#827873]">
          Choose a client, service, and appointment time.
        </p>

        <BookingForm
          clients={clientOptions}
          services={serviceOptions}
        />
      </section>

      <section className="rounded-2xl border border-[#eae4df] bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-[#272321]">
            Recent bookings
          </h2>
          <p className="mt-1 text-sm text-[#827873]">
            Your latest 20 appointments.
          </p>
        </div>

        {bookingRows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#eae4df] px-6 py-10 text-center">
            <p className="font-medium text-[#272321]">
              No bookings yet
            </p>
            <p className="mt-2 text-sm text-[#827873]">
              Create your first booking using the form above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#eae4df] text-[#827873]">
                  <th className="px-3 py-3 font-medium">Client</th>
                  <th className="px-3 py-3 font-medium">Service</th>
                  <th className="px-3 py-3 font-medium">Date & time</th>
                  <th className="px-3 py-3 font-medium">Price</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Actions</th>
                  <th className="px-3 py-3 font-medium">Manage status</th>
                </tr>
              </thead>
              <tbody>
                {bookingRows.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b border-[#f2eeea] last:border-0"
                  >
                    <td className="px-3 py-4 font-medium text-[#272321]">
                      {booking.clientName}
                    </td>
                    <td className="px-3 py-4 text-[#514a46]">
                      {booking.serviceName}
                    </td>
                    <td className="px-3 py-4 text-[#514a46]">
                      {formatDate(new Date(booking.startsAt))}
                    </td>
                    <td className="px-3 py-4 text-[#514a46]">
                      {formatPrice(booking.priceKobo)}
                    </td>
                    <td className="px-3 py-4">
                      <span className="rounded-full bg-[#f5e8e9] px-3 py-1 text-xs font-medium capitalize text-[#8f4b57]">
                        {booking.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                    {booking.status !== "cancelled" &&
                        booking.status !== "completed" && (
                        <CancelBookingButton bookingId={booking.id} />
                        )}
                    </td>
                    <td className="px-3 py-4">
                    <BookingStatusControl
                        bookingId={booking.id}
                        status={booking.status as "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show"}
                    />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
