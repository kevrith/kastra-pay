/**
 * GET/PUT /api/v1/merchants/settlement
 * Merchant settlement configuration (bank details, frequency, M-Pesa B2C phone).
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const merchant = await prisma.merchant.findUnique({
    where: { userId: session.user.id },
    select: {
      settlementBankCode: true,
      settlementAccountNo: true,
      settlementAccountName: true,
      settlementBankName: true,
      mpesaB2CPhone: true,
      settlementFrequency: true,
    },
  });

  if (!merchant) {
    return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
  }

  return NextResponse.json(merchant);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const merchant = await prisma.merchant.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!merchant) {
    return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
  }

  const body = await req.json();

  const allowedFrequencies = ["DAILY", "WEEKLY", "MONTHLY"];
  const frequency = allowedFrequencies.includes(body.settlementFrequency)
    ? body.settlementFrequency
    : undefined;

  await prisma.merchant.update({
    where: { id: merchant.id },
    data: {
      settlementBankCode: body.settlementBankCode || null,
      settlementAccountNo: body.settlementAccountNo || null,
      settlementAccountName: body.settlementAccountName || null,
      settlementBankName: body.settlementBankName || null,
      mpesaB2CPhone: body.mpesaB2CPhone || null,
      ...(frequency && { settlementFrequency: frequency }),
    },
  });

  return NextResponse.json({ success: true });
}
