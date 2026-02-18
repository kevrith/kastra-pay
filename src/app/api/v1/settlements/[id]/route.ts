/**
 * GET /api/v1/settlements/[id] — Get settlement details
 * POST /api/v1/settlements/[id] — Retry a failed settlement (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { processSettlement } from "@/services/settlement/settlement.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const settlement = await prisma.settlement.findUnique({
    where: { id },
    include: {
      merchant: {
        select: { id: true, businessName: true, slug: true, userId: true },
      },
    },
  });

  if (!settlement) {
    return NextResponse.json({ error: "Settlement not found" }, { status: 404 });
  }

  // Merchants can only view their own settlements
  if (
    session.user.role !== "SUPER_ADMIN" &&
    settlement.merchant.userId !== session.user.id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(settlement);
}

/** Retry a failed settlement (admin only) */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const settlement = await prisma.settlement.findUnique({
    where: { id },
  });

  if (!settlement) {
    return NextResponse.json({ error: "Settlement not found" }, { status: 404 });
  }

  if (settlement.status !== "FAILED") {
    return NextResponse.json(
      { error: "Only failed settlements can be retried" },
      { status: 400 }
    );
  }

  // Reset to PENDING so processSettlement can pick it up
  await prisma.settlement.update({
    where: { id },
    data: { status: "PENDING", failureReason: null },
  });

  const result = await processSettlement(id);

  return NextResponse.json(result);
}
