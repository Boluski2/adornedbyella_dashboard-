import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

const productionUrl = process.env.DATABASE_URL;
const testUrl = process.env.DATABASE_URL_TEST;

if (!productionUrl || !testUrl) {
  throw new Error("Both database URLs must be configured.");
}

if (productionUrl === testUrl) {
  throw new Error("Safety check failed: production and test URLs are identical.");
}

export default defineConfig({
  schema: "./src/lib/db/*-schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: productionUrl,
  },
  strict: true,
  verbose: true,
});
