/**
 * M-Pesa B2C (Business to Customer) Disbursement Service
 * Sends money from KastraPay's M-Pesa account to merchants' M-Pesa numbers.
 * Used for settling M-Pesa payments to merchants.
 */

import { MPESA_BASE_URL } from "@/lib/constants";
import { PaymentProviderError } from "@/lib/errors";

let cachedToken: { token: string; expiresAt: number } | null = null;

interface B2CTransferParams {
  phoneNumber: string; // Merchant's M-Pesa number
  amount: number;
  reference: string;
  remarks?: string;
}

interface B2CResult {
  success: boolean;
  providerRef?: string;
  error?: string;
  data?: Record<string, unknown>;
}

function getBaseUrl(): string {
  const env = (process.env.MPESA_ENVIRONMENT || "sandbox") as "sandbox" | "production";
  return MPESA_BASE_URL[env];
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const consumerKey = process.env.MPESA_CONSUMER_KEY || "";
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET || "";
  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  const response = await fetch(
    `${getBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`,
    { method: "GET", headers: { Authorization: `Basic ${credentials}` } }
  );

  if (!response.ok) {
    throw new PaymentProviderError("Failed to get M-Pesa access token", "mpesa");
  }

  const data = await response.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + 3500 * 1000,
  };

  return cachedToken.token;
}

function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\s+/g, "").replace(/-/g, "");
  if (cleaned.startsWith("+")) cleaned = cleaned.substring(1);
  if (cleaned.startsWith("0")) cleaned = "254" + cleaned.substring(1);
  return cleaned;
}

/** Initiate B2C payment (send money to merchant's M-Pesa) */
export async function initiateB2CTransfer(
  params: B2CTransferParams
): Promise<B2CResult> {
  const token = await getAccessToken();
  const baseUrl = getBaseUrl();
  const phoneNumber = formatPhoneNumber(params.phoneNumber);
  const shortCode = process.env.MPESA_SHORTCODE || "";
  const callbackBase = process.env.MPESA_CALLBACK_BASE_URL || "";

  const response = await fetch(`${baseUrl}/mpesa/b2c/v3/paymentrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      OriginatorConversationID: params.reference,
      InitiatorName: process.env.MPESA_B2C_INITIATOR || "apitest",
      SecurityCredential: process.env.MPESA_B2C_SECURITY_CREDENTIAL || "",
      CommandID: "BusinessPayment",
      Amount: Math.round(params.amount),
      PartyA: shortCode,
      PartyB: phoneNumber,
      Remarks: params.remarks || "Settlement payment",
      QueueTimeOutURL: `${callbackBase}/api/webhooks/mpesa/b2c/timeout`,
      ResultURL: `${callbackBase}/api/webhooks/mpesa/b2c/result`,
      Occasion: "Settlement",
    }),
  });

  const data = await response.json();

  if (data.ResponseCode !== "0") {
    return {
      success: false,
      error: data.ResponseDescription || data.errorMessage || "B2C transfer failed",
      data,
    };
  }

  return {
    success: true,
    providerRef: data.ConversationID,
    data,
  };
}

/** Query B2C transaction status */
export async function queryB2CStatus(
  conversationId: string
): Promise<B2CResult> {
  const token = await getAccessToken();
  const baseUrl = getBaseUrl();
  const shortCode = process.env.MPESA_SHORTCODE || "";
  const callbackBase = process.env.MPESA_CALLBACK_BASE_URL || "";

  const response = await fetch(`${baseUrl}/mpesa/transactionstatus/v1/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      Initiator: process.env.MPESA_B2C_INITIATOR || "apitest",
      SecurityCredential: process.env.MPESA_B2C_SECURITY_CREDENTIAL || "",
      CommandID: "TransactionStatusQuery",
      TransactionID: conversationId,
      PartyA: shortCode,
      IdentifierType: "4",
      ResultURL: `${callbackBase}/api/webhooks/mpesa/b2c/result`,
      QueueTimeOutURL: `${callbackBase}/api/webhooks/mpesa/b2c/timeout`,
      Remarks: "Settlement status query",
    }),
  });

  const data = await response.json();

  if (data.ResponseCode !== "0") {
    return {
      success: false,
      error: data.ResponseDescription || "Status query failed",
    };
  }

  return {
    success: true,
    providerRef: conversationId,
    data,
  };
}
