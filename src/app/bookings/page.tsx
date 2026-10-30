
import { and, asc, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { auth } from "@/lib/db/auth";
import { db } from "@/lib/db";
import { bookings, clients, services } from "@/lib/db/app-schema";
import BookingForm from "./booking-form";
import CancelBookingButton from "./cancel-booking-button";
import BookingStatusControl from "./booking-status-control";
import BookingCalendar from "./booking-calendar";
import RecentBookingsFilter from "./recent-bookings-filter";

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
      .where(
        and(
            eq(services.ownerId, ownerId),
            eq(services.isActive, true),
        ),
        )
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
      .orderBy(desc(bookings.startsAt)),
  ]);

  const calendarBookings = bookingRows.map((booking) => ({
  id: booking.id,
  startsAt: new Date(booking.startsAt).toISOString(),
  endsAt: new Date(booking.endsAt).toISOString(),
  clientName: booking.clientName,
  serviceName: booking.serviceName,
  status: booking.status,
  priceKobo: booking.priceKobo,
    }));

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
        <BookingCalendar
        bookings={calendarBookings}
        clients={clientOptions}
        services={serviceOptions}
        />
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
            <RecentBookingsFilter
            bookings={bookingRows.slice(0, 20).map((booking) => ({
                ...booking,
                startsAt: new Date(booking.startsAt).toISOString(),
                status: booking.status as
                | "scheduled"
                | "confirmed"
                | "completed"
                | "cancelled"
                | "no_show",
            }))}
            />
        )}
      </section>
    </main>
  );
}
