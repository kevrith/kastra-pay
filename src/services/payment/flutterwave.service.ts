import { PaymentProviderError } from "@/lib/errors";
import type {
  PaymentGateway,
  InitiatePaymentParams,
  InitiatePaymentResult,
  PaymentVerificationResult,
  RefundParams,
  RefundResult,
} from "./payment-gateway";
import type { PaymentMethod } from "@prisma/client";

const FLUTTERWAVE_BASE_URL = "https://api.flutterwave.com/v3";

export class FlutterwaveService implements PaymentGateway {
  provider = "flutterwave";
  supportedMethods: PaymentMethod[] = [
    "FLUTTERWAVE_CARD",
    "FLUTTERWAVE_MOBILE_MONEY",
  ];

  private get secretKey(): string {
    return process.env.FLUTTERWAVE_SECRET_KEY || "";
  }

  private get headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.secretKey}`,
      "Content-Type": "application/json",
    };
  }

  async initiate(params: InitiatePaymentParams): Promise<InitiatePaymentResult> {
    const response = await fetch(`${FLUTTERWAVE_BASE_URL}/payments`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({
        tx_ref: params.idempotencyKey,
        amount: params.amount,
        currency: params.currency,
        redirect_url: params.callbackUrl,
        customer: {
          email: params.customerEmail || "customer@example.com",
          phonenumber: params.customerPhone,
          name: params.customerName,
        },
        customizations: {
          title: "Kastra Pay",
          description: params.description || "Payment",
        },
        meta: params.metadata,
      }),
    });

    const data = await response.json();

    if (data.status !== "success") {
      return {
        success: false,
        providerRef: "",
        error: data.message || "Failed to initiate Flutterwave payment",
      };
    }

    return {
      success: true,
      providerRef: params.idempotencyKey,
      redirectUrl: data.data.link,
    };
  }

  async verify(txRef: string): Promise<PaymentVerificationResult> {
    // First, get the transaction ID from tx_ref
    const response = await fetch(
      `${FLUTTERWAVE_BASE_URL}/transactions/verify_by_reference?tx_ref=${txRef}`,
      {
        method: "GET",
        headers: this.headers,
      }
    );

    const data = await response.json();

    if (data.status !== "success" || !data.data) {
      return {
        success: false,
        status: "failed",
        error: data.message || "Verification failed",
      };
    }

    const txData = data.data;

    if (txData.status === "successful") {
      return {
        success: true,
        status: "completed",
        providerRef: String(txData.id),
        amount: txData.amount,
      };
    }

    if (txData.status === "pending") {
      return {
        success: true,
        status: "pending",
        providerRef: String(txData.id),
      };
    }

    return {
      success: false,
      status: "failed",
      providerRef: String(txData.id),
      error: txData.processor_response || "Payment failed",
    };
  }

  async refund(params: RefundParams): Promise<RefundResult> {
    const response = await fetch(
      `${FLUTTERWAVE_BASE_URL}/transactions/${params.providerRef}/refund`,
      {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({
          amount: params.amount,
          comments: params.reason || "Refund",
        }),
      }
    );

    const data = await response.json();

    if (data.status !== "success") {
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
