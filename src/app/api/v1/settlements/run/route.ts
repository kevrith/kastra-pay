/**
 * POST /api/v1/settlements/run
 * Triggers the settlement cycle for all eligible merchants.
 * Protected by a secret key (SETTLEMENT_CRON_SECRET) for Vercel Cron or manual trigger.
 */

import { NextRequest, NextResponse } from "next/server";
import { runSettlementCycle } from "@/services/settlement/settlement.service";

export async function POST(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.SETTLEMENT_CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: "SETTLEMENT_CRON_SECRET not configured" },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await runSettlementCycle();

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error) {
    console.error("Settlement cycle failed:", error);
    return NextResponse.json(
      { error: "Settlement cycle failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
