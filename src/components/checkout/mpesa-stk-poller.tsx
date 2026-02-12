"use client";

import { CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MpesaStkPollerProps {
  status: "idle" | "waiting" | "completed" | "failed" | "timeout";
  countdown: number;
  mpesaReceipt: string | null;
  error: string | null;
  onRetry: () => void;
}

export function MpesaStkPoller({
  status,
  countdown,
  mpesaReceipt,
  error,
  onRetry,
}: MpesaStkPollerProps) {
  if (status === "idle") return null;

  return (
    <div className="rounded-lg border p-6 text-center space-y-4">
      {status === "waiting" && (
        <>
          <div className="flex justify-center">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold">{countdown}</span>
              </div>
            </div>
          </div>
          <div>
            <p className="font-semibold">Waiting for M-Pesa confirmation</p>
            <p className="text-sm text-muted-foreground mt-1">
              Check your phone and enter your M-Pesa PIN to complete the payment
            </p>
          </div>
        </>
      )}

      {status === "completed" && (
        <>
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
          <div>
            <p className="font-semibold text-green-700 dark:text-green-400">
              Payment Successful!
            </p>
            {mpesaReceipt && (
              <p className="text-sm text-muted-foreground mt-1">
                M-Pesa Receipt: <span className="font-mono">{mpesaReceipt}</span>
              </p>
            )}
          </div>
        </>
      )}

      {status === "failed" && (
        <>
          <XCircle className="h-12 w-12 text-destructive mx-auto" />
          <div>
            <p className="font-semibold text-destructive">Payment Failed</p>
            <p className="text-sm text-muted-foreground mt-1">
              {error || "The payment could not be processed"}
            </p>
          </div>
          <Button onClick={onRetry} variant="outline">
            Try Again
          </Button>
        </>
      )}

      {status === "timeout" && (
        <>
          <Clock className="h-12 w-12 text-yellow-500 mx-auto" />
          <div>
            <p className="font-semibold">Payment Timed Out</p>
            <p className="text-sm text-muted-foreground mt-1">
              We didn&apos;t receive a confirmation. The payment may still be
              processing.
            </p>
          </div>
          <Button onClick={onRetry} variant="outline">
            Check Again
          </Button>
        </>
      )}
    </div>
  );
}
