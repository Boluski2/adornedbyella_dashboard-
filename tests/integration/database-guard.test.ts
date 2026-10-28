import { describe, expect, it } from "vitest";

describe("Adornedbyella integration environment", () => {
  it("uses a configured test database instead of the main database", () => {
    expect(process.env.DATABASE_URL_TEST).toBeTruthy();
    expect(process.env.DATABASE_URL).toBe(process.env.DATABASE_URL_TEST);
    expect(process.env.DATABASE_URL).not.toBe(
      process.env.DATABASE_URL_MAIN_FOR_TEST,
    );
  });
});
