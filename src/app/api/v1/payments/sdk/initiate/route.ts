export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { paymentOrchestrator } from "@/services/payment/payment-orchestrator";
import { handleApiError } from "@/lib/errors";
import { rateLimiters } from "@/lib/rate-limit";
import { validateApiKey } from "@/lib/api-key-auth";

const sdkPaymentSchema = z.object({
  method: z.enum([
    "MPESA_STK",
    "MPESA_C2B",
    "FLUTTERWAVE_CARD",
    "FLUTTERWAVE_MOBILE_MONEY",
    "PAYSTACK_CARD",
    "PAYSTACK_MOBILE_MONEY",
  ]),
  amount: z.number().positive().max(999999999999),
  currency: z.string().default("KES"),
  customerPhone: z.string().optional(),
  customerEmail: z.string().email().optional(),
  customerName: z.string().optional(),
  description: z.string().max(500).optional(),
  idempotencyKey: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

function corsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  try {
    // Rate limit
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const rl = rateLimiters.payment(ip);
    if (!rl.success) {
      return NextResponse.json(
        { error: { message: "Too many requests" } },
        { status: 429, headers: { ...headers, "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
    }

    // Validate API key
    const authResult = await validateApiKey(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: { message: authResult.error } },
        { status: 401, headers }
      );
    }

    const body = await request.json();
    const data = sdkPaymentSchema.parse(body);

    const result = await paymentOrchestrator.initiatePayment({
      method: data.method,
      amount: data.amount,
      currency: data.currency,
      merchantId: authResult.merchantId!,
      idempotencyKey: data.idempotencyKey,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      customerName: data.customerName,
      description: data.description,
      metadata: {
        ...data.metadata,
        source: "sdk",
        origin: origin || "unknown",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          transactionId: result.transaction.id,
          status: result.transaction.status,
          redirectUrl: result.redirectUrl,
          checkoutRequestId: result.checkoutRequestId,
        },
      },
      { headers }
    );
  } catch (error) {
    const errorResponse = handleApiError(error);
    // Add CORS headers to error responses
    const body = await errorResponse.json();
    return NextResponse.json(body, {
      status: errorResponse.status,
      headers,
    });
  }
}
