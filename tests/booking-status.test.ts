
import { describe, expect, it } from "vitest";

import {
  canTransitionBookingStatus,
  getAllowedNextStatuses,
} from "../src/lib/bookings/status";

describe("getAllowedNextStatuses", () => {
  it("allows only confirmation for scheduled bookings", () => {
    expect(getAllowedNextStatuses("scheduled")).toEqual([
      "confirmed",
    ]);
  });

  it("allows completion or no-show for confirmed bookings", () => {
    expect(getAllowedNextStatuses("confirmed")).toEqual([
      "completed",
      "no_show",
    ]);
  });

  it("returns no next statuses for completed bookings", () => {
    expect(getAllowedNextStatuses("completed")).toEqual([]);
  });

  it("returns no next statuses for cancelled bookings", () => {
    expect(getAllowedNextStatuses("cancelled")).toEqual([]);
  });

  it("returns no next statuses for no-show bookings", () => {
    expect(getAllowedNextStatuses("no_show")).toEqual([]);
  });
});

describe("canTransitionBookingStatus", () => {
  it("allows scheduled to confirmed", () => {
    expect(canTransitionBookingStatus("scheduled", "confirmed"))
      .toBe(true);
  });

  it("allows confirmed to completed", () => {
    expect(canTransitionBookingStatus("confirmed", "completed"))
      .toBe(true);
  });

  it("allows confirmed to no-show", () => {
    expect(canTransitionBookingStatus("confirmed", "no_show"))
      .toBe(true);
  });

  it("rejects scheduled to completed", () => {
    expect(canTransitionBookingStatus("scheduled", "completed"))
      .toBe(false);
  });

  it("rejects scheduled to no-show", () => {
    expect(canTransitionBookingStatus("scheduled", "no_show"))
      .toBe(false);
  });

  it("rejects transitions from completed bookings", () => {
    expect(canTransitionBookingStatus("completed", "confirmed"))
      .toBe(false);
  });

  it("rejects transitions from cancelled bookings", () => {
    expect(canTransitionBookingStatus("cancelled", "confirmed"))
      .toBe(false);
  });

  it("rejects transitions from no-show bookings", () => {
    expect(canTransitionBookingStatus("no_show", "confirmed"))
      .toBe(false);
  });
});
