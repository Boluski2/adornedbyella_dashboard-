import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("better-auth", () => ({
  betterAuth: vi.fn(),
}));

vi.mock("@better-auth/drizzle-adapter", () => ({
  drizzleAdapter: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {},
}));

vi.mock("../src/lib/db/auth-schema", () => ({
  user: {},
  session: {},
  account: {},
  verification: {},
}));

describe("Better Auth configuration requirements", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("requires BETTER_AUTH_SECRET", async () => {
    vi.stubEnv("BETTER_AUTH_SECRET", "");
    vi.stubEnv("BETTER_AUTH_URL", "http://localhost:3000");

    await expect(import("../src/lib/db/auth")).rejects.toThrow(
      "BETTER_AUTH_SECRET is not configured.",
    );
  });

  it("requires BETTER_AUTH_URL", async () => {
    vi.stubEnv("BETTER_AUTH_SECRET", "test-secret-for-unit-tests");
    vi.stubEnv("BETTER_AUTH_URL", "");

    await expect(import("../src/lib/db/auth")).rejects.toThrow(
      "BETTER_AUTH_URL is not configured.",
    );
  });
});
