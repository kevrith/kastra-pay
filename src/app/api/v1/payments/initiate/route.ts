export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { initiatePaymentSchema } from "@/lib/validators/payment";
import { paymentOrchestrator } from "@/services/payment/payment-orchestrator";
import { handleApiError } from "@/lib/errors";
import { rateLimiters } from "@/lib/rate-limit";
import { validateApiKey } from "@/lib/api-key-auth";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const rl = rateLimiters.payment(ip);
    if (!rl.success) {
      return NextResponse.json(
        { error: { message: "Too many requests. Please try again later." } },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
    }

    // If an API key is provided, validate it and use its merchantId
    const authHeader = request.headers.get("authorization");
    let apiKeyMerchantId: string | undefined;

    if (authHeader?.startsWith("Bearer kp_")) {
      const authResult = await validateApiKey(request);
      if (!authResult.success) {
        return NextResponse.json(
          { error: { message: authResult.error } },
          { status: 401 }
        );
      }
      apiKeyMerchantId = authResult.merchantId;
    }

    const body = await request.json();
    const data = initiatePaymentSchema.parse(body);

    // If API key auth, enforce that merchantId matches the key's merchant
    if (apiKeyMerchantId && data.merchantId !== apiKeyMerchantId) {
      return NextResponse.json(
        { error: { message: "API key does not match the provided merchantId" } },
        { status: 403 }
      );
    }

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
