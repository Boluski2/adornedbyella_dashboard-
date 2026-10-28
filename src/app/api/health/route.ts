
import { sql } from "drizzle-orm";
import { connection } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  await connection();

  try {
    const result = await db.execute(
      sql`SELECT NOW() AS database_time`
    );

    return Response.json({
      status: "ok",
      database: "connected",
      timestamp: result.rows[0]?.database_time,
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    return Response.json(
      {
        status: "error",
        message: "Database connection failed.",
      },
      { status: 503 }
    );
  }
}
