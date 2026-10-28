
import { afterAll, describe, expect, it } from "vitest";
import pg from "pg";
import { auth } from "@/lib/db/auth";

const baseURL = process.env.BETTER_AUTH_URL;
const testDatabaseURL = process.env.DATABASE_URL_TEST;
const mainDatabaseURL = process.env.DATABASE_URL_MAIN_FOR_TEST;

if (!baseURL) {
  throw new Error("BETTER_AUTH_URL is not configured.");
}

if (
  !testDatabaseURL ||
  process.env.DATABASE_URL !== testDatabaseURL ||
  testDatabaseURL === mainDatabaseURL
) {
  throw new Error("Authentication tests must use the isolated test database.");
}

const email = `glamtrack-test-${Date.now()}@example.com`;
const password = "Test-Only-Password-938!";

async function authRequest(
  path: string,
  options: {
    method?: "GET" | "POST";
    body?: Record<string, string>;
    cookie?: string;
  } = {},
) {
  const headers = new Headers({
    "content-type": "application/json",
  });

  if (options.cookie) {
    headers.set("cookie", options.cookie);
  }

  return auth.handler(
    new Request(new URL(`/api/auth${path}`, baseURL), {
      method: options.method ?? "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    }),
  );
}

describe("Better Auth integration", () => {
  afterAll(async () => {
    const client = new pg.Client({
      connectionString: testDatabaseURL,
    });

    try {
      await client.connect();


      await client.query(
        `DELETE FROM "session"
         WHERE user_id IN (
           SELECT id FROM "user" WHERE email = $1
         )`,
        [email],
      );

      await client.query(
        `DELETE FROM "account"
         WHERE user_id IN (
           SELECT id FROM "user" WHERE email = $1
         )`,
        [email],
      );

      await client.query(
        `DELETE FROM "user" WHERE email = $1`,
        [email],
      );
    } finally {
      await client.end().catch(() => {});
    }
  });

  it("registers, signs in, and retrieves the authenticated session", async () => {
    const signupResponse = await authRequest("/sign-up/email", {
      method: "POST",
      body: {
        name: "GlamTrack Integration Test",
        email,
        password,
      },
    });

    expect(signupResponse.status).toBe(200);

    const signupData = await signupResponse.json();

    expect(signupData.user.email).toBe(email);
    expect(signupData.user.id).toBeTruthy();

    const signinResponse = await authRequest("/sign-in/email", {
      method: "POST",
      body: { email, password },
    });

    expect(signinResponse.status).toBe(200);

    const signinData = await signinResponse.json();

    expect(signinData.user.email).toBe(email);

    const cookieHeaders = signinResponse.headers.getSetCookie();
    const cookie = cookieHeaders
      .map((value) => value.split(";")[0])
      .join("; ");

    expect(cookie).toBeTruthy();

    const sessionResponse = await authRequest("/get-session", {
      cookie,
    });

    expect(sessionResponse.status).toBe(200);

    const sessionData = await sessionResponse.json();

    expect(sessionData.user.email).toBe(email);
    expect(sessionData.session.id).toBeTruthy();
  });

  it("rejects an incorrect password", async () => {
    const response = await authRequest("/sign-in/email", {
      method: "POST",
      body: {
        email,
        password: "Definitely-Wrong-Password-123!",
      },
    });

    expect(response.status).toBeGreaterThanOrEqual(400);
  });
});
