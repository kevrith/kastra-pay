export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, XCircle, Clock, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SuccessPageProps {
  searchParams: Promise<{
    reference?: string;
    tx_ref?: string;
    transaction_id?: string;
    status?: string;
    trxref?: string;
  }>;
}

export default async function PaymentSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;

  // Get the reference from different provider params
  const reference = params.reference || params.tx_ref || params.trxref;

  if (!reference) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Invalid Payment Reference</h1>
            <p className="text-muted-foreground mb-6">
              No payment reference was found. Please check your payment status with the merchant.
            </p>
            <Button asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Look up the transaction by idempotencyKey (which is the tx_ref/reference)
  const transaction = await prisma.transaction.findFirst({
    where: {
      OR: [
        { idempotencyKey: reference },
        { providerRef: reference },
      ],
    },
    include: {
      merchant: {
        select: { businessName: true },
      },
    },
  });

  if (!transaction) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Payment Processing</h1>
            <p className="text-muted-foreground mb-6">
              Your payment is being processed. Please check back shortly.
            </p>
            <Button asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isSuccess = transaction.status === "COMPLETED";
  const isPending = transaction.status === "PENDING" || transaction.status === "PROCESSING";
  const isFailed = transaction.status === "FAILED" || transaction.status === "CANCELLED";

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image src="/k-pay.png" alt="Kastra Pay" width={40} height={40} className="rounded-lg" />
          </div>
          {isSuccess && (
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-2" />
          )}
          {isPending && (
            <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-2" />
          )}
          {isFailed && (
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-2" />
          )}
          <CardTitle className="text-2xl">
            {isSuccess && "Payment Successful!"}
            {isPending && "Payment Processing"}
            {isFailed && "Payment Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Amount</span>
              <span className="font-bold text-lg">
                {transaction.currency} {Number(transaction.amount).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Merchant</span>
              <span className="text-sm font-medium">{transaction.merchant.businessName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={isSuccess ? "default" : isPending ? "outline" : "destructive"}>
                {transaction.status}
              </Badge>
            </div>
            {transaction.mpesaReceiptNumber && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Receipt</span>
                <span className="text-sm font-mono">{transaction.mpesaReceiptNumber}</span>
              </div>
            )}
            {transaction.description && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Description</span>
                <span className="text-sm">{transaction.description}</span>
              </div>
            )}
          </div>

          {isSuccess && (
            <p className="text-sm text-center text-muted-foreground">
              A receipt has been recorded for this transaction.
            </p>
          )}
          {isPending && (
            <p className="text-sm text-center text-muted-foreground">
              Your payment is still being confirmed. You will receive a notification once completed.
            </p>
          )}
          {isFailed && (
            <p className="text-sm text-center text-muted-foreground">
              {transaction.failureReason || "Your payment could not be processed. Please try again or contact the merchant."}
            </p>
          )}

          <div className="pt-2">
            <Button asChild className="w-full">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Secured by Kastra Pay
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
