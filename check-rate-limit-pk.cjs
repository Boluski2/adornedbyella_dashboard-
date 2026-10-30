const { Client } = require("pg");
require("dotenv").config({ path: ".env.local" });

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL_TEST,
  });

  try {
    await client.connect();

    const result = await client.query(`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_schema = 'public'
        AND table_name = 'rateLimit'
        AND constraint_type = 'PRIMARY KEY';
    `);

    console.table(result.rows);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
