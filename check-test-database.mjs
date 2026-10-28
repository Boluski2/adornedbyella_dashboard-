import pg from "pg";
import { config } from "dotenv";

config({ path: ".env.local" });

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL_TEST,
});

try {
  await client.connect();

  const result = await client.query(`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename;
  `);

  console.log("Tables currently in the test database:");

  if (result.rows.length === 0) {
    console.log("No tables found.");
  } else {
    for (const row of result.rows) {
      console.log("-", row.tablename);
    }
  }
} catch {
  console.error("Could not inspect the test database.");
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
