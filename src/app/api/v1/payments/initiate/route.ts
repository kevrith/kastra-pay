export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { initiatePaymentSchema } from "@/lib/validators/payment";
import { paymentOrchestrator } from "@/services/payment/payment-orchestrator";
import { handleApiError } from "@/lib/errors";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = initiatePaymentSchema.parse(body);

    const result = await paymentOrchestrator.initiatePayment({
      method: data.method,
      amount: data.amount,
      currency: data.currency,
      merchantId: data.merchantId,
      idempotencyKey: data.idempotencyKey,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      customerName: data.customerName,
      description: data.description,
      paymentLinkId: data.paymentLinkId,
      metadata: data.metadata,
    });

    return Response.json({
      success: true,
      data: {
        transactionId: result.transaction.id,
        status: result.transaction.status,
        redirectUrl: result.redirectUrl,
        checkoutRequestId: result.checkoutRequestId,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
