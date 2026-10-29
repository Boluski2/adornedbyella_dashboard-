
export type BookingStatus =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export type UpdatableStatus = "confirmed" | "completed" | "no_show";

const nextStatuses: Record<BookingStatus, UpdatableStatus[]> = {
  scheduled: ["confirmed"],
  confirmed: ["completed", "no_show"],
  completed: [],
  cancelled: [],
  no_show: [],
};

export function getAllowedNextStatuses(
  status: BookingStatus,
): UpdatableStatus[] {
  return [...nextStatuses[status]];
}

export function canTransitionBookingStatus(
  currentStatus: BookingStatus,
  nextStatus: UpdatableStatus,
): boolean {
  return nextStatuses[currentStatus].includes(nextStatus);
}
