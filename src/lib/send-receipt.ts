import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { sendPaymentReceiptEmail } from "@/lib/email";
import { PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { format } from "date-fns";

/**
 * Creates a Receipt record and sends an email receipt for a completed transaction.
 * This is fire-and-forget — failures are logged but don't affect the caller.
 */
export async function createAndSendReceipt(transactionId: string): Promise<void> {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        merchant: { select: { businessName: true, userId: true } },
      },
    });

    if (!transaction || transaction.status !== "COMPLETED") return;

    // Check if receipt already exists
    const existingReceipt = await prisma.receipt.findUnique({
      where: { transactionId: transaction.id },
    });
    if (existingReceipt) return;

    // Generate a unique receipt number
    const receiptNumber = `KP-${nanoid(10).toUpperCase()}`;

    // Create receipt record
    const receipt = await prisma.receipt.create({
      data: {
        transactionId: transaction.id,
        receiptNumber,
        emailSentAt: transaction.customerEmail ? new Date() : null,
      },
    });

    // Send email if customer has an email address
    if (transaction.customerEmail) {
      await sendPaymentReceiptEmail(transaction.customerEmail, {
        merchantName: transaction.merchant.businessName,
        amount: Number(transaction.amount),
        currency: transaction.currency,
        paymentMethod:
          PAYMENT_METHOD_LABELS[transaction.paymentMethod] || transaction.paymentMethod,
        transactionId: transaction.id,
        receiptNumber: transaction.mpesaReceiptNumber || receiptNumber,
        description: transaction.description || undefined,
        date: format(transaction.completedAt || transaction.createdAt, "MMM d, yyyy HH:mm"),
      });
    }

    // Notify the merchant about the payment
    await prisma.notification.create({
      data: {
        userId: transaction.merchant.userId,
        type: "PAYMENT",
        title: "Payment Received",
        message: `Payment of ${transaction.currency} ${Number(transaction.amount).toLocaleString()} from ${transaction.customerName || transaction.customerEmail || "a customer"}.`,
        metadata: { transactionId: transaction.id, receiptId: receipt.id } as object,
      },
    });
  } catch (err) {
    console.error("Failed to create/send receipt:", err);
  }
}
