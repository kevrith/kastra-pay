/**
 * Flutterwave Settlement Service
 * Initiates bank transfers to merchants via Flutterwave's Transfer API.
 */

const FLUTTERWAVE_BASE_URL = "https://api.flutterwave.com/v3";

interface InitiateTransferParams {
  amount: number;
  accountNumber: string;
  accountBank: string; // Bank code
  accountName: string;
  reference: string;
  narration: string;
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
    Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY || ""}`,
    "Content-Type": "application/json",
  };
}

/** Initiate a bank transfer to a merchant */
export async function initiateTransfer(
  params: InitiateTransferParams
): Promise<TransferResult> {
  const response = await fetch(`${FLUTTERWAVE_BASE_URL}/transfers`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      account_bank: params.accountBank,
      account_number: params.accountNumber,
      amount: params.amount,
      narration: params.narration,
      currency: params.currency || "KES",
      reference: params.reference,
      beneficiary_name: params.accountName,
    }),
  });

  const data = await response.json();

  if (data.status !== "success") {
    return {
      success: false,
      error: data.message || "Failed to initiate Flutterwave transfer",
    };
  }

  return {
    success: true,
    providerRef: String(data.data.id),
    data: data.data,
  };
}

/** Verify a transfer status */
export async function verifyTransfer(
  transferId: string
): Promise<TransferResult> {
  const response = await fetch(
    `${FLUTTERWAVE_BASE_URL}/transfers/${transferId}`,
    { method: "GET", headers: getHeaders() }
  );

  const data = await response.json();

  if (data.status !== "success") {
    return {
      success: false,
      error: data.message || "Failed to verify transfer",
    };
  }

  return {
    success: true,
    providerRef: String(data.data.id),
    data: data.data,
  };
}

/** List available banks for Flutterwave */
export async function listBanks(
  country: string = "KE"
): Promise<{ success: boolean; banks?: Array<{ name: string; code: string }>; error?: string }> {
  const response = await fetch(
    `${FLUTTERWAVE_BASE_URL}/banks/${country}`,
    { method: "GET", headers: getHeaders() }
  );

  const data = await response.json();

  if (data.status !== "success") {
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
