export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Store raw webhook event
    await prisma.webhookEvent.create({
      data: {
        provider: "mpesa",
        eventType: "stkpush_callback",
        payload: body,
        headers: Object.fromEntries(request.headers.entries()),
      },
    });

    const callback = body.Body?.stkCallback;
    if (!callback) {
      return Response.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    const checkoutRequestId = callback.CheckoutRequestID;
    const resultCode = callback.ResultCode;

    // Find the transaction
    const transaction = await prisma.transaction.findFirst({
      where: { mpesaCheckoutReqId: checkoutRequestId },
    });

    if (!transaction) {
      console.error(`No transaction found for CheckoutRequestID: ${checkoutRequestId}`);
      return Response.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    // Skip if already in terminal state
    if (transaction.status === "COMPLETED" || transaction.status === "FAILED") {
      return Response.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    if (resultCode === 0) {
      // Payment successful — extract metadata
      const metadata = callback.CallbackMetadata?.Item || [];
      const receiptNumber = metadata.find(
        (item: { Name: string }) => item.Name === "MpesaReceiptNumber"
      )?.Value;
      const amount = metadata.find(
        (item: { Name: string }) => item.Name === "Amount"
      )?.Value;
      const phoneNumber = metadata.find(
        (item: { Name: string }) => item.Name === "PhoneNumber"
      )?.Value;

      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "COMPLETED",
          mpesaReceiptNumber: receiptNumber ? String(receiptNumber) : null,
          providerResponse: body,
          customerPhone: phoneNumber ? String(phoneNumber) : transaction.customerPhone,
          netAmount: amount ? Number(amount) : Number(transaction.amount),
          completedAt: new Date(),
        },
      });

      // Update webhook event with transaction reference
      await prisma.webhookEvent.updateMany({
        where: {
          provider: "mpesa",
          status: "received",
          createdAt: { gte: new Date(Date.now() - 5000) },
        },
        data: {
          transactionId: transaction.id,
          merchantId: transaction.merchantId,
          status: "processed",
          processedAt: new Date(),
        },
      });
    } else {
      // Payment failed
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "FAILED",
          failureReason: callback.ResultDesc || "Payment failed",
          providerResponse: body,
        },
      });
    }

    return Response.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("M-Pesa webhook error:", error);
    return Response.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
}
