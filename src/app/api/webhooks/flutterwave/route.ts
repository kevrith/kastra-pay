export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature
    const secretHash = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
    const signature = request.headers.get("verif-hash");

    if (secretHash && signature !== secretHash) {
      return Response.json({ error: "Invalid signature" }, { status: 400 });
    }

    const body = await request.json();

    // Store raw webhook event
    await prisma.webhookEvent.create({
      data: {
        provider: "flutterwave",
        eventType: body.event || "charge.completed",
        payload: body,
        headers: Object.fromEntries(request.headers.entries()),
      },
    });

    const txData = body.data;
    if (!txData || !txData.tx_ref) {
      return Response.json({ status: "ok" });
    }

    // Find transaction by idempotency key (tx_ref)
    const transaction = await prisma.transaction.findUnique({
      where: { idempotencyKey: txData.tx_ref },
    });

    if (!transaction) {
      console.error(`No transaction found for tx_ref: ${txData.tx_ref}`);
      return Response.json({ status: "ok" });
    }

    // Skip if already in terminal state
    if (transaction.status === "COMPLETED" || transaction.status === "FAILED") {
      return Response.json({ status: "ok" });
    }

    if (txData.status === "successful") {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "COMPLETED",
          providerRef: String(txData.id),
          providerResponse: body,
          providerFee: txData.app_fee ? Number(txData.app_fee) : null,
          netAmount: txData.amount_settled
            ? Number(txData.amount_settled)
            : Number(transaction.amount),
          customerEmail: txData.customer?.email || transaction.customerEmail,
          customerName: txData.customer?.name || transaction.customerName,
          completedAt: new Date(),
        },
      });
    } else {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "FAILED",
          providerRef: String(txData.id),
          providerResponse: body,
          failureReason: txData.processor_response || "Payment failed",
        },
      });
    }

    return Response.json({ status: "ok" });
  } catch (error) {
    console.error("Flutterwave webhook error:", error);
    return Response.json({ status: "ok" });
  }
}
