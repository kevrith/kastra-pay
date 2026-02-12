import type {
  PaymentGateway,
  InitiatePaymentParams,
  InitiatePaymentResult,
  PaymentVerificationResult,
  RefundParams,
  RefundResult,
} from "./payment-gateway";
import type { PaymentMethod } from "@prisma/client";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

export class PaystackService implements PaymentGateway {
  provider = "paystack";
  supportedMethods: PaymentMethod[] = [
    "PAYSTACK_CARD",
    "PAYSTACK_MOBILE_MONEY",
  ];

  private get secretKey(): string {
    return process.env.PAYSTACK_SECRET_KEY || "";
  }

  private get headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.secretKey}`,
      "Content-Type": "application/json",
    };
  }

  async initiate(params: InitiatePaymentParams): Promise<InitiatePaymentResult> {
    // Paystack expects amount in lowest currency unit (kobo for NGN, cents for KES)
    const amountInSmallestUnit = Math.round(params.amount * 100);

    const response = await fetch(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({
          email: params.customerEmail || "customer@example.com",
          amount: amountInSmallestUnit,
          currency: params.currency,
          reference: params.idempotencyKey,
          callback_url: params.callbackUrl,
          metadata: {
            merchantId: params.merchantId,
            customerPhone: params.customerPhone,
            customerName: params.customerName,
            ...params.metadata,
          },
        }),
      }
    );

    const data = await response.json();

    if (!data.status) {
      return {
        success: false,
        providerRef: "",
        error: data.message || "Failed to initiate Paystack payment",
      };
    }

    return {
      success: true,
      providerRef: data.data.reference,
      redirectUrl: data.data.authorization_url,
    };
  }

  async verify(reference: string): Promise<PaymentVerificationResult> {
    const response = await fetch(
      `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: this.headers,
      }
    );

    const data = await response.json();

    if (!data.status || !data.data) {
      return {
        success: false,
        status: "failed",
        error: data.message || "Verification failed",
      };
    }

    const txData = data.data;

    if (txData.status === "success") {
      return {
        success: true,
        status: "completed",
        providerRef: txData.reference,
        amount: txData.amount / 100, // Convert back from smallest unit
      };
    }

    if (txData.status === "pending" || txData.status === "ongoing") {
      return {
        success: true,
        status: "pending",
        providerRef: txData.reference,
      };
    }

    return {
      success: false,
      status: "failed",
      providerRef: txData.reference,
      error: txData.gateway_response || "Payment failed",
    };
  }

  async refund(params: RefundParams): Promise<RefundResult> {
    const amountInSmallestUnit = Math.round(params.amount * 100);

    const response = await fetch(`${PAYSTACK_BASE_URL}/refund`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({
        transaction: params.providerRef,
        amount: amountInSmallestUnit,
        merchant_note: params.reason || "Refund",
      }),
    });

    const data = await response.json();

    if (!data.status) {
      return {
        success: false,
        error: data.message || "Refund failed",
      };
    }

    return {
      success: true,
      providerRef: String(data.data.id),
    };
  }
}
