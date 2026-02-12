import { z } from "zod";

export const initiatePaymentSchema = z.object({
  method: z.enum([
    "MPESA_STK",
    "MPESA_C2B",
    "FLUTTERWAVE_CARD",
    "FLUTTERWAVE_MOBILE_MONEY",
    "PAYSTACK_CARD",
    "PAYSTACK_MOBILE_MONEY",
  ]),
  amount: z
    .number()
    .positive("Amount must be positive")
    .max(999999999999, "Amount too large"),
  currency: z.string().default("KES"),
  merchantId: z.string().min(1, "Merchant ID is required"),
  customerPhone: z
    .string()
    .regex(/^(\+254|0)[17]\d{8}$/, "Invalid Kenyan phone number")
    .optional(),
  customerEmail: z.string().email("Invalid email").optional(),
  customerName: z.string().optional(),
  description: z.string().max(500).optional(),
  idempotencyKey: z.string().min(1, "Idempotency key is required"),
  paymentLinkId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const verifyPaymentSchema = z.object({
  checkoutRequestId: z.string().optional(),
  transactionId: z.string().optional(),
  providerRef: z.string().optional(),
});

export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
