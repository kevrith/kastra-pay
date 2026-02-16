export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const checks: Record<string, { status: string; latency?: number; error?: string }> = {};
  const start = Date.now();

  // Database check
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: "healthy", latency: Date.now() - dbStart };
  } catch (err) {
    checks.database = {
      status: "unhealthy",
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }

  // Environment checks
  checks.mpesa = {
    status: process.env.MPESA_CONSUMER_KEY ? "configured" : "not_configured",
  };
  checks.flutterwave = {
    status: process.env.FLUTTERWAVE_SECRET_KEY ? "configured" : "not_configured",
  };
  checks.paystack = {
    status: process.env.PAYSTACK_SECRET_KEY ? "configured" : "not_configured",
  };
  checks.email = {
    status: process.env.RESEND_API_KEY ? "configured" : "not_configured",
  };

  const isHealthy = checks.database.status === "healthy";
  const totalLatency = Date.now() - start;

  return NextResponse.json(
    {
      status: isHealthy ? "healthy" : "degraded",
      version: process.env.npm_package_version || "1.0.0",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      latency: totalLatency,
      checks,
    },
    { status: isHealthy ? 200 : 503 }
  );
}
