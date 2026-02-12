import { MPESA_BASE_URL } from "@/lib/constants";
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

let cachedToken: { token: string; expiresAt: number } | null = null;

export class MpesaService implements PaymentGateway {
  provider = "mpesa";
  supportedMethods: PaymentMethod[] = ["MPESA_STK", "MPESA_C2B"];

  private get baseUrl(): string {
    const env = (process.env.MPESA_ENVIRONMENT || "sandbox") as "sandbox" | "production";
    return MPESA_BASE_URL[env];
  }

  private get consumerKey(): string {
    return process.env.MPESA_CONSUMER_KEY || "";
  }

  private get consumerSecret(): string {
    return process.env.MPESA_CONSUMER_SECRET || "";
  }

  private get shortCode(): string {
    return process.env.MPESA_SHORTCODE || "";
  }

  private get passkey(): string {
    return process.env.MPESA_PASSKEY || "";
  }

  private async getAccessToken(): Promise<string> {
    if (cachedToken && cachedToken.expiresAt > Date.now()) {
      return cachedToken.token;
    }

    const credentials = Buffer.from(
      `${this.consumerKey}:${this.consumerSecret}`
    ).toString("base64");

    const response = await fetch(
      `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      {
        method: "GET",
        headers: { Authorization: `Basic ${credentials}` },
      }
    );

    if (!response.ok) {
      throw new PaymentProviderError(
        "Failed to get M-Pesa access token",
        "mpesa"
      );
    }

    const data = await response.json();
    cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + 3500 * 1000, // Cache for ~58 minutes
    };

    return cachedToken.token;
  }

  private generateTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  private generatePassword(timestamp: string): string {
    const data = `${this.shortCode}${this.passkey}${timestamp}`;
    return Buffer.from(data).toString("base64");
  }

  private formatPhoneNumber(phone: string): string {
    let cleaned = phone.replace(/\s+/g, "").replace(/-/g, "");
    if (cleaned.startsWith("+")) {
      cleaned = cleaned.substring(1);
    }
    if (cleaned.startsWith("0")) {
      cleaned = "254" + cleaned.substring(1);
    }
    return cleaned;
  }

  async initiate(params: InitiatePaymentParams): Promise<InitiatePaymentResult> {
    if (!params.customerPhone) {
      return {
        success: false,
        providerRef: "",
        error: "Phone number is required for M-Pesa payments",
      };
    }

    const token = await this.getAccessToken();
    const timestamp = this.generateTimestamp();
    const password = this.generatePassword(timestamp);
    const phoneNumber = this.formatPhoneNumber(params.customerPhone);

    const response = await fetch(
      `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          BusinessShortCode: this.shortCode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: Math.round(params.amount),
          PartyA: phoneNumber,
          PartyB: this.shortCode,
          PhoneNumber: phoneNumber,
          CallBackURL: params.callbackUrl,
          AccountReference: params.idempotencyKey.substring(0, 12),
          TransactionDesc: params.description || "Payment",
        }),
      }
    );

    const data = await response.json();

    if (data.ResponseCode !== "0") {
      return {
        success: false,
        providerRef: "",
        error: data.ResponseDescription || "STK Push failed",
      };
    }

    return {
      success: true,
      providerRef: data.MerchantRequestID,
      checkoutRequestId: data.CheckoutRequestID,
    };
  }

  async verify(checkoutRequestId: string): Promise<PaymentVerificationResult> {
    const token = await this.getAccessToken();
    const timestamp = this.generateTimestamp();
    const password = this.generatePassword(timestamp);

    const response = await fetch(
      `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          BusinessShortCode: this.shortCode,
          Password: password,
          Timestamp: timestamp,
          CheckoutRequestID: checkoutRequestId,
        }),
      }
    );

    const data = await response.json();

    if (data.ResultCode === "0" || data.ResultCode === 0) {
      return {
        success: true,
        status: "completed",
        providerRef: checkoutRequestId,
        receiptNumber: data.MpesaReceiptNumber,
      };
    }

    if (data.errorCode === "500.001.1001") {
      return {
        success: true,
        status: "pending",
        providerRef: checkoutRequestId,
      };
    }

    return {
      success: false,
      status: "failed",
      providerRef: checkoutRequestId,
      error: data.ResultDesc || "Payment verification failed",
    };
  }

  async refund(params: RefundParams): Promise<RefundResult> {
    const token = await this.getAccessToken();
    const callbackBase = process.env.MPESA_CALLBACK_BASE_URL || "";

    const response = await fetch(
      `${this.baseUrl}/mpesa/reversal/v1/request`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Initiator: "apitest",
          SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL || "",
          CommandID: "TransactionReversal",
          TransactionID: params.providerRef,
          Amount: Math.round(params.amount),
          ReceiverParty: this.shortCode,
          RecieverIdentifierType: "11",
          ResultURL: `${callbackBase}/api/webhooks/mpesa`,
          QueueTimeOutURL: `${callbackBase}/api/webhooks/mpesa`,
          Remarks: params.reason || "Refund",
          Occasion: "Refund",
        }),
      }
    );

    const data = await response.json();

    if (data.ResponseCode === "0") {
      return {
        success: true,
        providerRef: data.ConversationID,
      };
    }

    return {
      success: false,
      error: data.ResponseDescription || "Reversal request failed",
    };
  }
}
