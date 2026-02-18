/**
 * GET /api/v1/settlements
 * List settlements — admin sees all, merchants see their own.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  getAllSettlements,
  getMerchantSettlements,
  getSettlementStats,
} from "@/services/settlement/settlement.service";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const status = searchParams.get("status") || undefined;
  const includeStats = searchParams.get("stats") === "true";

  // Admin view
  if (session.user.role === "SUPER_ADMIN") {
    const data = await getAllSettlements(page, limit, status);
    const stats = includeStats ? await getSettlementStats() : undefined;

    return NextResponse.json({ ...data, stats });
  }

  // Merchant view
  const merchant = await prisma.merchant.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!merchant) {
    return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
  }

  const data = await getMerchantSettlements(merchant.id, page, limit);
  return NextResponse.json(data);
}
