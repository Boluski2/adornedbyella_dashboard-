
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "@/lib/db";
import {
  user,
  session,
  account,
  verification,
  rateLimit,
} from "./auth-schema";

const secret = process.env.BETTER_AUTH_SECRET;
const baseURL = process.env.BETTER_AUTH_URL;

if (!secret) {
  throw new Error("BETTER_AUTH_SECRET is not configured.");
}

if (!baseURL) {
  throw new Error("BETTER_AUTH_URL is not configured.");
}

export const auth = betterAuth({
  secret,
  baseURL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      session,
      account,
      verification,
      rateLimit,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  rateLimit: {
  enabled: true,
  storage: "database",
  window: 60,
  max: 100,
  customRules: {
    "/sign-in/email": {
      window: 60,
      max: 5,
    },
    "/sign-up/email": {
      window: 60,
      max: 5,
    },
  },
},
});
