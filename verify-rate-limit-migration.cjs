const { Client } = require("pg");
require("dotenv").config({ path: ".env.local" });

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL_TEST,
  });

  try {
    await client.connect();

    const migrations = await client.query(`
      SELECT id, hash, created_at
      FROM drizzle.__drizzle_migrations
      ORDER BY id;
    `);

    const columns = await client.query(`
      SELECT column_name, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'rateLimit'
      ORDER BY ordinal_position;
    `);

    console.log("Migration count:", migrations.rowCount);
    console.log("rateLimit columns:");
    console.table(columns.rows);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
