/**
 * POST /api/webhooks/mpesa/b2c/timeout
 * Handles M-Pesa B2C timeout notifications.
 */

import { NextResponse } from "next/server";

export async function POST() {
  // M-Pesa requires a 200 response; the result endpoint handles actual updates.
  console.warn("M-Pesa B2C timeout received");
  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}
