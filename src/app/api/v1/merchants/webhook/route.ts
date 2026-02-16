export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const webhookSchema = z.object({
  webhookUrl: z.string().url().or(z.literal("")).optional(),
  webhookSecret: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.merchantId) {
    return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  }

  const merchant = await prisma.merchant.findUnique({
    where: { id: session.user.merchantId },
    select: { webhookUrl: true, webhookSecret: true },
  });

  return NextResponse.json({
    data: {
      webhookUrl: merchant?.webhookUrl || "",
      webhookSecret: merchant?.webhookSecret ? "••••••••" : "",
    },
  });
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.merchantId) {
    return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  }

  const body = await request.json();
  const data = webhookSchema.parse(body);

  const updateData: Record<string, string | null> = {};
  if (data.webhookUrl !== undefined) {
    updateData.webhookUrl = data.webhookUrl || null;
  }
  if (data.webhookSecret !== undefined && !data.webhookSecret?.startsWith("••")) {
    updateData.webhookSecret = data.webhookSecret || null;
  }

  await prisma.merchant.update({
    where: { id: session.user.merchantId },
    data: updateData,
  });

  return NextResponse.json({ success: true });
}
