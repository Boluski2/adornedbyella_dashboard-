import { afterEach, describe, expect, it, vi } from "vitest";

describe("Better Auth configuration requirements", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("requires BETTER_AUTH_SECRET", async () => {
    vi.stubEnv("BETTER_AUTH_SECRET", "");
    vi.stubEnv("BETTER_AUTH_URL", "http://localhost:3000");
    vi.stubEnv("DATABASE_URL", "postgresql://test:test@localhost:5432/test");

    await expect(import("../src/lib/db/auth")).rejects.toThrow(
      "BETTER_AUTH_SECRET is not configured.",
    );
  });

  it("requires BETTER_AUTH_URL", async () => {
    vi.stubEnv("BETTER_AUTH_SECRET", "test-secret-for-unit-tests");
    vi.stubEnv("BETTER_AUTH_URL", "");
    vi.stubEnv("DATABASE_URL", "postgresql://test:test@localhost:5432/test");

    await expect(import("../src/lib/db/auth")).rejects.toThrow(
      "BETTER_AUTH_URL is not configured.",
    );
  });
});
