const { Client } = require("pg");
require("dotenv").config({ path: ".env.local" });

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL_TEST,
  });

  try {
    await client.connect();

    const result = await client.query(`
      SELECT COUNT(*)::int AS total
      FROM "rateLimit";
    `);

    console.log("Existing rate-limit records:", result.rows[0].total);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
