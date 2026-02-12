export const APP_NAME = "Kastra Pay";
export const APP_DESCRIPTION = "Multi-merchant payment platform for Africa";

export const SUPPORTED_CURRENCIES = ["KES", "USD", "NGN"] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const DEFAULT_CURRENCY = "KES";

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  MPESA_STK: "M-Pesa",
  MPESA_C2B: "M-Pesa (C2B)",
  FLUTTERWAVE_CARD: "Card (Flutterwave)",
  FLUTTERWAVE_MOBILE_MONEY: "Mobile Money (Flutterwave)",
  PAYSTACK_CARD: "Card (Paystack)",
  PAYSTACK_MOBILE_MONEY: "Mobile Money (Paystack)",
};

export const TRANSACTION_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
  REVERSED: "Reversed",
};

export const STK_POLL_INTERVAL_MS = 3000;
export const STK_TIMEOUT_SECONDS = 60;

export const ITEMS_PER_PAGE = 20;

export const MPESA_BASE_URL = {
  sandbox: "https://sandbox.safaricom.co.ke",
  production: "https://api.safaricom.co.ke",
} as const;
