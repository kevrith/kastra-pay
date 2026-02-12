"use client";

import { useState } from "react";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PaymentMethodSelector } from "./payment-method-selector";
import { MpesaStkPoller } from "./mpesa-stk-poller";
import { useStkPoll } from "@/hooks/use-stk-poll";

type PaymentMethodType = "MPESA_STK" | "FLUTTERWAVE_CARD" | "PAYSTACK_CARD";

interface CheckoutFormProps {
  merchantId: string;
  merchantName: string;
  amount: number | null;
  currency: string;
  title: string;
  description?: string;
  paymentLinkId?: string;
}

export function CheckoutForm({
  merchantId,
  merchantName,
  amount: fixedAmount,
  currency,
  title,
  description,
  paymentLinkId,
}: CheckoutFormProps) {
  const [method, setMethod] = useState<PaymentMethodType>("MPESA_STK");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(fixedAmount ? String(fixedAmount) : "");
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const stkPoll = useStkPoll(checkoutRequestId, transactionId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const paymentAmount = fixedAmount || Number(amount);

    if (!paymentAmount || paymentAmount <= 0) {
      toast.error("Please enter a valid amount");
      setIsLoading(false);
      return;
    }

    if (method === "MPESA_STK" && !phone) {
      toast.error("Phone number is required for M-Pesa payments");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/v1/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
          amount: paymentAmount,
          currency,
          merchantId,
          customerPhone: phone || undefined,
          customerEmail: email || undefined,
          customerName: name || undefined,
          description: description || title,
          idempotencyKey: nanoid(),
          paymentLinkId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error?.message || "Payment initiation failed");
        return;
      }

      // Handle different payment methods
      if (method === "MPESA_STK") {
        setCheckoutRequestId(data.data.checkoutRequestId);
        setTransactionId(data.data.transactionId);
        stkPoll.startPolling();
      } else if (data.data.redirectUrl) {
        // For card payments, redirect to hosted payment page
        window.location.href = data.data.redirectUrl;
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const isPolling = stkPoll.status !== "idle";

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
          <span className="text-primary font-bold text-lg">
            {merchantName.charAt(0)}
          </span>
        </div>
        <CardTitle>{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        <p className="text-sm text-muted-foreground">by {merchantName}</p>
      </CardHeader>
      <CardContent>
        {isPolling ? (
          <MpesaStkPoller
            status={stkPoll.status}
            countdown={stkPoll.countdown}
            mpesaReceipt={stkPoll.mpesaReceipt}
            error={stkPoll.error}
            onRetry={stkPoll.retry}
          />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Amount */}
            {fixedAmount ? (
              <div className="text-center py-4">
                <p className="text-3xl font-bold">
                  {currency} {fixedAmount.toLocaleString()}
                </p>
              </div>
            ) : (
              <div>
                <Label>Amount ({currency})</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            )}

            <Separator />

            {/* Payment Method */}
            <PaymentMethodSelector selected={method} onSelect={setMethod} />

            <Separator />

            {/* Customer Details */}
            <div className="space-y-3">
              <div>
                <Label>Name (optional)</Label>
                <Input
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {method === "MPESA_STK" ? (
                <div>
                  <Label>M-Pesa Phone Number</Label>
                  <Input
                    type="tel"
                    placeholder="+254712345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    You&apos;ll receive an STK Push on this number
                  </p>
                </div>
              ) : (
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Pay {currency}{" "}
              {(fixedAmount || Number(amount) || 0).toLocaleString()}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Secured by Kastra Pay
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
