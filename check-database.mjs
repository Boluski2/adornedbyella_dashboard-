import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

const result = await sql`
  SELECT column_name, is_nullable
  FROM information_schema.columns
  WHERE table_name = 'business_profiles'
    AND column_name = 'website_title'
`;

console.log(result);
