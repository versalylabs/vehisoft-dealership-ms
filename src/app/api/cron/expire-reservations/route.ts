import { NextResponse } from "next/server";
import db from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/demo-store";

/**
 * Vercel Cron Route: Automatically reverts expired vehicle reservations
 * (Reserved -> Available) as specified in Section 7 of the Dealership spec.
 */
export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      ok: true,
      mode: "demo-store",
      message:
        "Neon DATABASE_URL not yet connected; client-side reservation expiry sync is active.",
    });
  }

  try {
    const now = new Date();
    const expiredReservations = await db.reservation.findMany({
      where: {
        isActive: true,
        expiryDate: { lt: now },
      },
    });

    for (const res of expiredReservations) {
      await db.$transaction([
        db.reservation.update({
          where: { id: res.id },
          data: { isActive: false },
        }),
        db.vehicle.updateMany({
          where: { id: res.vehicleId, status: "RESERVED" },
          data: { status: "AVAILABLE" },
        }),
        db.vehicleHistory.create({
          data: {
            vehicleId: res.vehicleId,
            eventType: "STATUS_CHANGE",
            previousVal: "RESERVED",
            newVal: "AVAILABLE",
            description:
              "Reservation expired — Vehicle automatically reverted (Reserved → Available)",
          },
        }),
      ]);
    }

    return NextResponse.json({
      ok: true,
      expiredCount: expiredReservations.length,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
