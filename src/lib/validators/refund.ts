import { z } from "zod";

export const initiateRefundSchema = z.object({
  transactionId: z.string().min(1, "Transaction ID is required"),
  amount: z
    .number()
    .positive("Amount must be positive")
    .max(999999999999, "Amount too large"),
  reason: z.string().min(1, "Reason is required").max(500),
});

export type InitiateRefundInput = z.infer<typeof initiateRefundSchema>;
