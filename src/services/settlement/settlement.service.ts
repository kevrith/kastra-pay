/**
 * Settlement Service
 * Calculates outstanding settlements for merchants, creates settlement records,
 * and dispatches payments via the appropriate provider.
 *
 * Flow:
 * 1. Find merchants due for settlement (based on their settlementFrequency)
 * 2. Aggregate completed transactions since last settlement
 * 3. Calculate platform fees and net amounts
 * 4. Create Settlement records
 * 5. Dispatch payouts via Paystack Transfer, Flutterwave Transfer, or M-Pesa B2C
 * 6. Update settlement status based on provider response
 */

import prisma from "@/lib/prisma";
import * as paystackSettlement from "./paystack-settlement.service";
import * as flutterwaveSettlement from "./flutterwave-settlement.service";
import * as mpesaB2C from "./mpesa-b2c.service";

const DEFAULT_COMMISSION_RATE = 0.025; // 2.5% platform fee

/** Round to 2 decimal places */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

interface SettlementSummary {
  merchantId: string;
  totalAmount: number;
  platformFee: number;
  providerFees: number;
  netAmount: number;
  transactionCount: number;
  periodStart: Date;
  periodEnd: Date;
}

/** Get the start date for the current settlement period based on frequency */
function getPeriodStart(frequency: string, now: Date): Date {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  switch (frequency) {
    case "DAILY":
      start.setDate(start.getDate() - 1);
      break;
    case "WEEKLY":
      start.setDate(start.getDate() - 7);
      break;
    case "MONTHLY":
      start.setMonth(start.getMonth() - 1);
      break;
    default:
      start.setDate(start.getDate() - 7);
  }

  return start;
}

/** Calculate settlement for a single merchant */
export async function calculateMerchantSettlement(
  merchantId: string
): Promise<SettlementSummary | null> {
  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId },
    select: {
      id: true,
      commissionRate: true,
      settlementFrequency: true,
    },
  });

  if (!merchant) return null;

  const now = new Date();
  const periodStart = getPeriodStart(merchant.settlementFrequency, now);

  // Find the last completed settlement to avoid double-paying
  const lastSettlement = await prisma.settlement.findFirst({
    where: {
      merchantId,
      status: { in: ["COMPLETED", "PROCESSING"] },
    },
    orderBy: { periodEnd: "desc" },
    select: { periodEnd: true },
  });

  const effectiveStart = lastSettlement?.periodEnd ?? periodStart;

  // Aggregate completed transactions not yet settled
  const transactions = await prisma.transaction.findMany({
    where: {
      merchantId,
      status: "COMPLETED",
      completedAt: {
        gte: effectiveStart,
        lte: now,
      },
    },
    select: {
      amount: true,
      platformFee: true,
      providerFee: true,
    },
  });

  if (transactions.length === 0) return null;

  const commissionRate = merchant.commissionRate
    ? Number(merchant.commissionRate)
    : DEFAULT_COMMISSION_RATE;

  let totalAmount = 0;
  let totalProviderFees = 0;

  for (const tx of transactions) {
    totalAmount += Number(tx.amount);
    if (tx.providerFee) {
      totalProviderFees += Number(tx.providerFee);
    }
  }

  const platformFee = round2(totalAmount * commissionRate);
  const netAmount = round2(totalAmount - platformFee - totalProviderFees);

  return {
    merchantId,
    totalAmount: round2(totalAmount),
    platformFee,
    providerFees: round2(totalProviderFees),
    netAmount,
    transactionCount: transactions.length,
    periodStart: effectiveStart,
    periodEnd: now,
  };
}

/** Create a settlement record in the database */
export async function createSettlement(summary: SettlementSummary) {
  const merchant = await prisma.merchant.findUnique({
    where: { id: summary.merchantId },
    select: {
      settlementBankCode: true,
      settlementAccountNo: true,
      mpesaB2CPhone: true,
      paystackSubAcctCode: true,
    },
  });

  // Determine payout method based on merchant config
  let paymentMethod = "PAYSTACK_TRANSFER";
  if (merchant?.mpesaB2CPhone) {
    paymentMethod = "MPESA_B2C";
  } else if (merchant?.paystackSubAcctCode || merchant?.settlementBankCode) {
    paymentMethod = "PAYSTACK_TRANSFER";
  } else {
    paymentMethod = "FLUTTERWAVE_TRANSFER";
  }

  return prisma.settlement.create({
    data: {
      merchantId: summary.merchantId,
      amount: summary.totalAmount,
      platformFee: summary.platformFee,
      providerFee: summary.providerFees,
      netAmount: summary.netAmount,
      transactionCount: summary.transactionCount,
      periodStart: summary.periodStart,
      periodEnd: summary.periodEnd,
      paymentMethod,
      status: "PENDING",
    },
  });
}

/** Process a pending settlement — dispatch the actual payout */
export async function processSettlement(settlementId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const settlement = await prisma.settlement.findUnique({
    where: { id: settlementId },
    include: {
      merchant: {
        select: {
          businessName: true,
          settlementBankCode: true,
          settlementAccountNo: true,
          settlementAccountName: true,
          mpesaB2CPhone: true,
          paystackSubAcctCode: true,
        },
      },
    },
  });

  if (!settlement) return { success: false, error: "Settlement not found" };
  if (settlement.status !== "PENDING") {
    return { success: false, error: `Settlement is ${settlement.status}, not PENDING` };
  }

  // Mark as processing
  await prisma.settlement.update({
    where: { id: settlementId },
    data: { status: "PROCESSING" },
  });

  const netAmount = Number(settlement.netAmount);
  const reference = `STL-${settlement.id}`;

  try {
    let result: { success: boolean; providerRef?: string; error?: string };

    switch (settlement.paymentMethod) {
      case "MPESA_B2C": {
        if (!settlement.merchant.mpesaB2CPhone) {
          throw new Error("Merchant M-Pesa B2C phone not configured");
        }
        result = await mpesaB2C.initiateB2CTransfer({
          phoneNumber: settlement.merchant.mpesaB2CPhone,
          amount: netAmount,
          reference,
          remarks: `Settlement for ${settlement.merchant.businessName}`,
        });
        break;
      }

      case "PAYSTACK_TRANSFER": {
        if (!settlement.merchant.settlementAccountNo || !settlement.merchant.settlementBankCode) {
          throw new Error("Merchant bank details not configured for Paystack transfer");
        }

        // Create recipient first if needed
        let recipientCode = settlement.merchant.paystackSubAcctCode;
        if (!recipientCode) {
          const recipientResult = await paystackSettlement.createTransferRecipient({
            name: settlement.merchant.settlementAccountName || settlement.merchant.businessName,
            accountNumber: settlement.merchant.settlementAccountNo,
            bankCode: settlement.merchant.settlementBankCode,
          });
          if (!recipientResult.success) {
            throw new Error(recipientResult.error || "Failed to create Paystack recipient");
          }
          recipientCode = recipientResult.providerRef!;

          // Save the recipient code for future use
          await prisma.merchant.update({
            where: { id: settlement.merchantId },
            data: { paystackSubAcctCode: recipientCode },
          });
        }

        result = await paystackSettlement.initiateTransfer({
          amount: netAmount,
          recipientCode,
          reason: `Settlement for ${settlement.merchant.businessName}`,
          reference,
        });
        break;
      }

      case "FLUTTERWAVE_TRANSFER": {
        if (!settlement.merchant.settlementAccountNo || !settlement.merchant.settlementBankCode) {
          throw new Error("Merchant bank details not configured for Flutterwave transfer");
        }
        result = await flutterwaveSettlement.initiateTransfer({
          amount: netAmount,
          accountNumber: settlement.merchant.settlementAccountNo,
          accountBank: settlement.merchant.settlementBankCode,
          accountName: settlement.merchant.settlementAccountName || settlement.merchant.businessName,
          reference,
          narration: `Settlement for ${settlement.merchant.businessName}`,
        });
        break;
      }

      default:
        throw new Error(`Unknown payment method: ${settlement.paymentMethod}`);
    }

    if (!result.success) {
      await prisma.settlement.update({
        where: { id: settlementId },
        data: {
          status: "FAILED",
          failureReason: result.error,
        },
      });
      return { success: false, error: result.error };
    }

    // Mark as completed (for transfers that complete immediately) or keep PROCESSING
    await prisma.settlement.update({
      where: { id: settlementId },
      data: {
        providerRef: result.providerRef,
        status: settlement.paymentMethod === "MPESA_B2C" ? "PROCESSING" : "COMPLETED",
        processedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    await prisma.settlement.update({
      where: { id: settlementId },
      data: {
        status: "FAILED",
        failureReason: errorMessage,
      },
    });
    return { success: false, error: errorMessage };
  }
}

/** Run the settlement cycle for all eligible merchants */
export async function runSettlementCycle(): Promise<{
  processed: number;
  failed: number;
  skipped: number;
  errors: string[];
}> {
  const results = { processed: 0, failed: 0, skipped: 0, errors: [] as string[] };

  // Find all active merchants
  const merchants = await prisma.merchant.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      businessName: true,
      settlementFrequency: true,
    },
  });

  for (const merchant of merchants) {
    try {
      // Calculate what's owed
      const summary = await calculateMerchantSettlement(merchant.id);

      if (!summary || summary.netAmount <= 0) {
        results.skipped++;
        continue;
      }

      // Create settlement record
      const settlement = await createSettlement(summary);

      // Process payout
      const result = await processSettlement(settlement.id);

      if (result.success) {
        results.processed++;
      } else {
        results.failed++;
        results.errors.push(`${merchant.businessName}: ${result.error}`);
      }
    } catch (error) {
      results.failed++;
      const msg = error instanceof Error ? error.message : "Unknown error";
      results.errors.push(`${merchant.businessName}: ${msg}`);
    }
  }

  return results;
}

/** Get settlement history for a merchant */
export async function getMerchantSettlements(
  merchantId: string,
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit;

  const [settlements, total] = await Promise.all([
    prisma.settlement.findMany({
      where: { merchantId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.settlement.count({ where: { merchantId } }),
  ]);

  return { settlements, total, page, limit, totalPages: Math.ceil(total / limit) };
}

/** Get all settlements (admin view) */
export async function getAllSettlements(
  page: number = 1,
  limit: number = 20,
  status?: string
) {
  const where = status ? { status: status as "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" } : {};
  const skip = (page - 1) * limit;

  const [settlements, total] = await Promise.all([
    prisma.settlement.findMany({
      where,
      include: {
        merchant: { select: { businessName: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.settlement.count({ where }),
  ]);

  return { settlements, total, page, limit, totalPages: Math.ceil(total / limit) };
}

/** Get settlement stats for admin dashboard */
export async function getSettlementStats() {
  const [pending, processing, completed, failed] = await Promise.all([
    prisma.settlement.count({ where: { status: "PENDING" } }),
    prisma.settlement.count({ where: { status: "PROCESSING" } }),
    prisma.settlement.count({ where: { status: "COMPLETED" } }),
    prisma.settlement.count({ where: { status: "FAILED" } }),
  ]);

  const totalSettled = await prisma.settlement.aggregate({
    where: { status: "COMPLETED" },
    _sum: { netAmount: true },
  });

  const totalFees = await prisma.settlement.aggregate({
    where: { status: "COMPLETED" },
    _sum: { platformFee: true },
  });

  return {
    counts: { pending, processing, completed, failed },
    totalSettled: Number(totalSettled._sum.netAmount || 0),
    totalFees: Number(totalFees._sum.platformFee || 0),
  };
}
