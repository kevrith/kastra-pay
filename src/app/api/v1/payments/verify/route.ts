export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { paymentOrchestrator } from "@/services/payment/payment-orchestrator";
import { handleApiError, NotFoundError } from "@/lib/errors";

async function verifyTransaction(transactionId?: string | null, checkoutRequestId?: string | null) {
  let transaction;

  if (transactionId) {
    transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });
  } else if (checkoutRequestId) {
    transaction = await prisma.transaction.findFirst({
      where: { mpesaCheckoutReqId: checkoutRequestId },
    });
  }

  if (!transaction) {
    throw new NotFoundError("Transaction not found");
  }

  // If still processing, try to verify with provider
  if (transaction.status === "PROCESSING" || transaction.status === "PENDING") {
    const providerRef =
      transaction.mpesaCheckoutReqId || transaction.providerRef;

    if (providerRef) {
      const result = await paymentOrchestrator.verifyPayment(
        transaction.paymentMethod,
        providerRef
      );

      if (result.status === "completed") {
        transaction = await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: "COMPLETED",
            mpesaReceiptNumber: result.receiptNumber || transaction.mpesaReceiptNumber,
            completedAt: new Date(),
          },
        });
      } else if (result.status === "failed") {
        transaction = await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: "FAILED",
            failureReason: result.error,
          },
        });
      }
    }
  }

  return Response.json({
    success: true,
    data: {
      id: transaction.id,
      status: transaction.status,
      amount: transaction.amount,
      currency: transaction.currency,
      paymentMethod: transaction.paymentMethod,
      mpesaReceiptNumber: transaction.mpesaReceiptNumber,
      completedAt: transaction.completedAt,
      failureReason: transaction.failureReason,
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    return await verifyTransaction(
      searchParams.get("transactionId"),
      searchParams.get("checkoutRequestId")
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return await verifyTransaction(
      body.transactionId,
      body.checkoutRequestId
    );
  } catch (error) {
    return handleApiError(error);
  }
}
