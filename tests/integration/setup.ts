import { config } from "dotenv";
import pg from "pg";

config({ path: ".env.local" });

const mainUrl = process.env.DATABASE_URL;
const testUrl = process.env.DATABASE_URL_TEST;

if (!mainUrl || !testUrl) {
  throw new Error(
    "Integration tests require DATABASE_URL and DATABASE_URL_TEST in .env.local.",
  );
}

if (mainUrl === testUrl) {
  throw new Error(
    "Safety check failed: the test and main database URLs are identical.",
  );
}

process.env.DATABASE_URL_MAIN_FOR_TEST = mainUrl;
process.env.DATABASE_URL = testUrl;

const client = new pg.Client({ connectionString: testUrl });

try {
  await client.connect();

  const result = await client.query(`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  `);

  const existing = new Set(
    result.rows.map((row: { tablename: string }) => row.tablename),
  );

  const required = [
    "user",
    "session",
    "account",
    "verification",
    "clients",
    "services",
    "bookings",
  ];

  const missing = required.filter((table) => !existing.has(table));

  if (missing.length > 0) {
    throw new Error(
      `Test database is missing expected tables: ${missing.join(", ")}`,
    );
  }

  console.log("Integration database safety check passed.");
  console.log("Authentication and application tables are present.");
} finally {
  await client.end().catch(() => {});
}

