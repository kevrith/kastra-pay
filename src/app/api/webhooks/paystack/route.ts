export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature
    const secretKey = process.env.PAYSTACK_SECRET_KEY || "";
    const signature = request.headers.get("x-paystack-signature");
    const rawBody = await request.text();

    if (secretKey && signature) {
      const hash = crypto
        .createHmac("sha512", secretKey)
        .update(rawBody)
        .digest("hex");

      if (hash !== signature) {
        return Response.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    const body = JSON.parse(rawBody);

    // Store raw webhook event
    await prisma.webhookEvent.create({
      data: {
        provider: "paystack",
        eventType: body.event || "charge.success",
        payload: body,
        headers: Object.fromEntries(request.headers.entries()),
      },
    });

    if (body.event !== "charge.success") {
      return Response.json({ status: "ok" });
    }

    const txData = body.data;
    if (!txData || !txData.reference) {
      return Response.json({ status: "ok" });
    }

    // Find transaction by idempotency key (reference)
    const transaction = await prisma.transaction.findUnique({
      where: { idempotencyKey: txData.reference },
    });

    if (!transaction) {
      console.error(`No transaction found for reference: ${txData.reference}`);
      return Response.json({ status: "ok" });
    }

    // Skip if already in terminal state
    if (transaction.status === "COMPLETED" || transaction.status === "FAILED") {
      return Response.json({ status: "ok" });
    }

    if (txData.status === "success") {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "COMPLETED",
          providerRef: String(txData.id),
          providerResponse: body,
          providerFee: txData.fees ? Number(txData.fees) / 100 : null,
          netAmount: txData.amount ? Number(txData.amount) / 100 : Number(transaction.amount),
          customerEmail: txData.customer?.email || transaction.customerEmail,
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
          failureReason: txData.gateway_response || "Payment failed",
        },
      });
    }

    return Response.json({ status: "ok" });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return Response.json({ status: "ok" });
  }
}
