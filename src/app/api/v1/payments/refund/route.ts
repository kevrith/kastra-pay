export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { initiateRefundSchema } from "@/lib/validators/refund";
import { handleApiError } from "@/lib/errors";
import { MpesaService } from "@/services/payment/mpesa.service";
import { FlutterwaveService } from "@/services/payment/flutterwave.service";
import { PaystackService } from "@/services/payment/paystack.service";
import type { PaymentGateway } from "@/services/payment/payment-gateway";
import type { PaymentMethod } from "@prisma/client";

const gateways: Record<string, PaymentGateway> = {
  MPESA_STK: new MpesaService(),
  MPESA_C2B: new MpesaService(),
  FLUTTERWAVE_CARD: new FlutterwaveService(),
  FLUTTERWAVE_MOBILE_MONEY: new FlutterwaveService(),
  PAYSTACK_CARD: new PaystackService(),
  PAYSTACK_MOBILE_MONEY: new PaystackService(),
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.merchantId) {
      return NextResponse.json(
        { error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validated = initiateRefundSchema.parse(body);

    // Find the transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: validated.transactionId },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: { message: "Transaction not found" } },
        { status: 404 }
      );
    }

    // Ensure merchant owns this transaction
    if (transaction.merchantId !== session.user.merchantId) {
      return NextResponse.json(
        { error: { message: "Unauthorized" } },
        { status: 403 }
      );
    }

    // Ensure transaction is completed
    if (transaction.status !== "COMPLETED") {
      return NextResponse.json(
        { error: { message: "Only completed transactions can be refunded" } },
        { status: 400 }
      );
    }

    // Check refund amount doesn't exceed transaction amount
    const existingRefunds = await prisma.refund.aggregate({
      where: {
        transactionId: transaction.id,
        status: { in: ["COMPLETED", "PENDING", "PROCESSING"] },
      },
      _sum: { amount: true },
    });

    const totalRefunded = Number(existingRefunds._sum.amount || 0);
    if (totalRefunded + validated.amount > Number(transaction.amount)) {
      return NextResponse.json(
        { error: { message: `Refund amount exceeds remaining refundable amount (${Number(transaction.amount) - totalRefunded})` } },
        { status: 400 }
      );
    }

    // Create refund record
    const refund = await prisma.refund.create({
      data: {
        transactionId: transaction.id,
        merchantId: session.user.merchantId,
        amount: validated.amount,
        reason: validated.reason,
        status: "PROCESSING",
      },
    });

    // Initiate refund with provider
    const gateway = gateways[transaction.paymentMethod as PaymentMethod];
    if (!gateway) {
      await prisma.refund.update({
        where: { id: refund.id },
        data: { status: "FAILED" },
      });
      return NextResponse.json(
        { error: { message: "Unsupported payment method for refund" } },
        { status: 400 }
      );
    }

    const result = await gateway.refund({
      transactionId: transaction.id,
      providerRef: transaction.providerRef || "",
      amount: validated.amount,
      reason: validated.reason,
    });

    if (result.success) {
      await prisma.refund.update({
        where: { id: refund.id },
        data: {
          status: "COMPLETED",
          providerRef: result.providerRef,
          completedAt: new Date(),
        },
      });

      // Update transaction status if fully refunded
      if (totalRefunded + validated.amount >= Number(transaction.amount)) {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { status: "REVERSED" },
        });
      }

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: "REFUND_INITIATED",
          entity: "Refund",
          entityId: refund.id,
          newValue: {
            transactionId: transaction.id,
            amount: validated.amount,
            reason: validated.reason,
          } as object,
        },
      });
    } else {
      await prisma.refund.update({
        where: { id: refund.id },
        data: { status: "FAILED" },
      });

      return NextResponse.json(
        { error: { message: result.error || "Refund failed" } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { refundId: refund.id, status: "COMPLETED" },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
