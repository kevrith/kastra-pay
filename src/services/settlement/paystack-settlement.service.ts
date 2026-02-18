/**
 * Paystack Settlement Service
 * Creates transfer recipients and initiates bank transfers to merchants.
 * Uses Paystack's Transfer API for automated payouts.
 */

const PAYSTACK_BASE_URL = "https://api.paystack.co";

interface CreateRecipientParams {
  name: string;
  accountNumber: string;
  bankCode: string;
  currency?: string;
}

interface InitiateTransferParams {
  amount: number; // In KES/NGN (will be converted to lowest unit)
  recipientCode: string;
  reason: string;
  reference: string;
  currency?: string;
}

interface TransferResult {
  success: boolean;
  providerRef?: string;
  error?: string;
  data?: Record<string, unknown>;
}

function getHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY || ""}`,
    "Content-Type": "application/json",
  };
}

/** Create a transfer recipient (merchant's bank account) */
export async function createTransferRecipient(
  params: CreateRecipientParams
): Promise<TransferResult> {
  const response = await fetch(`${PAYSTACK_BASE_URL}/transferrecipient`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      type: "nuban",
      name: params.name,
      account_number: params.accountNumber,
      bank_code: params.bankCode,
      currency: params.currency || "KES",
    }),
  });

  const data = await response.json();

  if (!data.status) {
    return {
      success: false,
      error: data.message || "Failed to create transfer recipient",
    };
  }

  return {
    success: true,
    providerRef: data.data.recipient_code,
    data: data.data,
  };
}

/** Initiate a transfer to a merchant */
export async function initiateTransfer(
  params: InitiateTransferParams
): Promise<TransferResult> {
  const amountInSmallestUnit = Math.round(params.amount * 100);

  const response = await fetch(`${PAYSTACK_BASE_URL}/transfer`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      source: "balance",
      amount: amountInSmallestUnit,
      recipient: params.recipientCode,
      reason: params.reason,
      reference: params.reference,
      currency: params.currency || "KES",
    }),
  });

  const data = await response.json();

  if (!data.status) {
    return {
      success: false,
      error: data.message || "Failed to initiate transfer",
    };
  }

  return {
    success: true,
    providerRef: data.data.transfer_code,
    data: data.data,
  };
}

/** Verify a transfer status */
export async function verifyTransfer(
  transferCode: string
): Promise<TransferResult> {
  const response = await fetch(
    `${PAYSTACK_BASE_URL}/transfer/verify/${encodeURIComponent(transferCode)}`,
    { method: "GET", headers: getHeaders() }
  );

  const data = await response.json();

  if (!data.status) {
    return {
      success: false,
      error: data.message || "Failed to verify transfer",
    };
  }

  return {
    success: true,
    providerRef: data.data.transfer_code,
    data: data.data,
  };
}

/** List available banks for Paystack */
export async function listBanks(
  country: string = "kenya"
): Promise<{ success: boolean; banks?: Array<{ name: string; code: string }>; error?: string }> {
  const response = await fetch(
    `${PAYSTACK_BASE_URL}/bank?country=${country}`,
    { method: "GET", headers: getHeaders() }
  );

  const data = await response.json();

  if (!data.status) {
    return { success: false, error: data.message || "Failed to list banks" };
  }

  return {
    success: true,
    banks: data.data.map((b: { name: string; code: string }) => ({
      name: b.name,
      code: b.code,
    })),
  };
}
