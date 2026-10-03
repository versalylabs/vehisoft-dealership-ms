import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/demo-store";
import db from "@/lib/db";

export async function GET() {
  const neonConfigured = isDatabaseConfigured();
  if (!neonConfigured) {
    return NextResponse.json({
      status: "ok",
      currency: "KSh. (KES)",
      databaseMode: "resilient-demo-store",
      message:
        "Application is running cleanly. Add your Neon PostgreSQL DATABASE_URL and DIRECT_URL in Vercel Environment Variables to switch to live cloud database persistence.",
    });
  }

  try {
    const vehicleCount = await db.vehicle.count();
    return NextResponse.json({
      status: "ok",
      currency: "KSh. (KES)",
      databaseMode: "neon-postgresql-connected",
      vehicleCount,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "degraded",
        databaseMode: "neon-connection-error",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
