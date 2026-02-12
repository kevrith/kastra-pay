import type { PaymentMethod } from "@prisma/client";

export interface InitiatePaymentParams {
  amount: number;
  currency: string;
  customerPhone?: string;
  customerEmail?: string;
  customerName?: string;
  merchantId: string;
  idempotencyKey: string;
  description?: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}

export interface InitiatePaymentResult {
  success: boolean;
  providerRef: string;
  checkoutRequestId?: string;
  redirectUrl?: string;
  error?: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  status: "completed" | "pending" | "failed" | "cancelled";
  providerRef?: string;
  receiptNumber?: string;
  amount?: number;
  error?: string;
}

export interface RefundParams {
  transactionId: string;
  providerRef: string;
  amount: number;
  reason?: string;
}

export interface RefundResult {
  success: boolean;
  providerRef?: string;
  error?: string;
}

export interface PaymentGateway {
  provider: string;
  supportedMethods: PaymentMethod[];
  initiate(params: InitiatePaymentParams): Promise<InitiatePaymentResult>;
  verify(providerRef: string): Promise<PaymentVerificationResult>;
  refund(params: RefundParams): Promise<RefundResult>;
}
