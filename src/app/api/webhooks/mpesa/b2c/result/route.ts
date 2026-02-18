/**
 * POST /api/webhooks/mpesa/b2c/result
 * Receives M-Pesa B2C payment results and updates settlement status.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = body.Result;

    if (!result) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    const conversationId = result.ConversationID;
    const resultCode = result.ResultCode;

    // Find the settlement by providerRef
    const settlement = await prisma.settlement.findFirst({
      where: { providerRef: conversationId },
    });

    if (!settlement) {
      console.warn("B2C result for unknown settlement:", conversationId);
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    if (resultCode === 0) {
      await prisma.settlement.update({
        where: { id: settlement.id },
        data: {
          status: "COMPLETED",
          processedAt: new Date(),
          providerResponse: body,
        },
      });
    } else {
      await prisma.settlement.update({
        where: { id: settlement.id },
        data: {
          status: "FAILED",
          failureReason: result.ResultDesc || "B2C transfer failed",
          providerResponse: body,
        },
      });
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("B2C result webhook error:", error);
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
}
