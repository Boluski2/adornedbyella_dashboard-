
import { and, eq, gt, lt, ne } from "drizzle-orm";

import { bookings } from "@/lib/db/app-schema";

export function bookingConflictCondition(
  ownerId: string,
  startsAt: Date,
  endsAt: Date,
) {
  return and(
    eq(bookings.ownerId, ownerId),
    ne(bookings.status, "cancelled"),
    lt(bookings.startsAt, endsAt),
    gt(bookings.endsAt, startsAt),
  );
}
