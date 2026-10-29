import { and, eq, gt, inArray, lt } from "drizzle-orm";
import { bookings } from "@/lib/db/app-schema";

export function bookingConflictCondition(
  ownerId: string,
  startsAt: Date,
  endsAt: Date,
) {
  return and(
    eq(bookings.ownerId, ownerId),
    inArray(bookings.status, ["scheduled", "confirmed"]),
    lt(bookings.startsAt, endsAt),
    gt(bookings.endsAt, startsAt),
  );
}
