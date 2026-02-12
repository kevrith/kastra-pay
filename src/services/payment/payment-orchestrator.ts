import { prisma } from "@/lib/prisma";
import { PaymentProviderError } from "@/lib/errors";
import { MpesaService } from "./mpesa.service";
import { FlutterwaveService } from "./flutterwave.service";
import { PaystackService } from "./paystack.service";
import type { PaymentGateway } from "./payment-gateway";
import type { PaymentMethod, Transaction } from "@prisma/client";

const gateways: Record<string, PaymentGateway> = {
  MPESA_STK: new MpesaService(),
  MPESA_C2B: new MpesaService(),
  FLUTTERWAVE_CARD: new FlutterwaveService(),
  FLUTTERWAVE_MOBILE_MONEY: new FlutterwaveService(),
  PAYSTACK_CARD: new PaystackService(),
  PAYSTACK_MOBILE_MONEY: new PaystackService(),
};

interface InitiateParams {
  method: PaymentMethod;
  amount: number;
  currency: string;
  merchantId: string;
  idempotencyKey: string;
  customerPhone?: string;
  customerEmail?: string;
  customerName?: string;
  description?: string;
  paymentLinkId?: string;
  metadata?: Record<string, unknown>;
}

export class PaymentOrchestrator {
  async initiatePayment(params: InitiateParams): Promise<{
    transaction: Transaction;
    redirectUrl?: string;
    checkoutRequestId?: string;
  }> {
    // 1. Check idempotency
    const existing = await prisma.transaction.findUnique({
      where: { idempotencyKey: params.idempotencyKey },
    });

    if (existing) {
      return {
        transaction: existing,
        checkoutRequestId: existing.mpesaCheckoutReqId || undefined,
      };
    }

    // 2. Validate merchant
    const merchant = await prisma.merchant.findUnique({
      where: { id: params.merchantId },
    });

    if (!merchant || merchant.status !== "ACTIVE") {
      throw new PaymentProviderError(
        "Merchant is not active or does not exist",
        "platform"
      );
    }

    // 3. Get the gateway
    const gateway = gateways[params.method];
    if (!gateway) {
      throw new PaymentProviderError(
        `Unsupported payment method: ${params.method}`,
        "platform"
      );
    }

    // 4. Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        merchantId: params.merchantId,
        paymentLinkId: params.paymentLinkId,
        idempotencyKey: params.idempotencyKey,
        amount: params.amount,
        currency: params.currency,
        paymentMethod: params.method,
        status: "PENDING",
        customerEmail: params.customerEmail,
        customerPhone: params.customerPhone,
        customerName: params.customerName,
        description: params.description,
        metadata: params.metadata as object | undefined,
      },
    });

    // 5. Initiate with provider
    const callbackBase = process.env.MPESA_CALLBACK_BASE_URL || process.env.NEXTAUTH_URL || "";
    const providerName = gateway.provider;

    // M-Pesa uses server-to-server callback (webhook), card providers redirect user to success page
    const isServerCallback = params.method === "MPESA_STK" || params.method === "MPESA_C2B";
    const callbackUrl = isServerCallback
      ? `${callbackBase}/api/webhooks/${providerName}`
      : `${callbackBase}/checkout/success?reference=${params.idempotencyKey}`;

    const result = await gateway.initiate({
      amount: params.amount,
      currency: params.currency,
      customerPhone: params.customerPhone,
      customerEmail: params.customerEmail,
      customerName: params.customerName,
      merchantId: params.merchantId,
      idempotencyKey: params.idempotencyKey,
      description: params.description,
      callbackUrl,
      metadata: params.metadata,
    });

    if (!result.success) {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "FAILED",
          failureReason: result.error,
        },
      });

      throw new PaymentProviderError(
        result.error || "Payment initiation failed",
        providerName
      );
    }

    // 6. Update transaction with provider ref
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: "PROCESSING",
        providerRef: result.providerRef,
        mpesaCheckoutReqId: result.checkoutRequestId,
      },
    });

    return {
      transaction: updatedTransaction,
      redirectUrl: result.redirectUrl,
      checkoutRequestId: result.checkoutRequestId,
    };
  }

  async verifyPayment(
    method: PaymentMethod,
    providerRef: string
  ) {
    const gateway = gateways[method];
    if (!gateway) {
      throw new PaymentProviderError(
        `Unsupported payment method: ${method}`,
        "platform"
      );
    }

    return gateway.verify(providerRef);
  }
}

export const paymentOrchestrator = new PaymentOrchestrator();
