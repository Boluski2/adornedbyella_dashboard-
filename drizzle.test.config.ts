import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

if (!process.env.DATABASE_URL_TEST) {
  throw new Error("DATABASE_URL_TEST is missing from .env.local");
}

if (process.env.DATABASE_URL_TEST === process.env.DATABASE_URL) {
  throw new Error("Safety check failed: test and production database URLs are identical.");
}

export default defineConfig({
  schema: "./src/lib/db/*-schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL_TEST,
  },
  strict: true,
  verbose: true,
});
