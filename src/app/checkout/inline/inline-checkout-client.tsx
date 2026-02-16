"use client";

import { useSearchParams } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Smartphone, CreditCard, CheckCircle, XCircle, ShieldCheck } from "lucide-react";

type PaymentMethod = "MPESA_STK" | "FLUTTERWAVE_CARD" | "PAYSTACK_CARD";
type CheckoutStep = "method" | "details" | "processing" | "success" | "failed";

function postToParent(data: Record<string, unknown>) {
  if (window.parent !== window) {
    window.parent.postMessage({ source: "kastrapay", ...data }, "*");
  }
}

export default function InlineCheckoutClient() {
  const params = useSearchParams();

  const apiKey = params.get("key") || "";
  const amount = Number(params.get("amount")) || 0;
  const currency = params.get("currency") || "KES";
  const email = params.get("email") || "";
  const phone = params.get("phone") || "";
  const name = params.get("name") || "";
  const description = params.get("description") || "";
  const idempotencyKey = params.get("idem") || "";
  const allowedMethods = params.get("methods")?.split(",") || ["MPESA_STK", "FLUTTERWAVE_CARD", "PAYSTACK_CARD"];
  const callbackUrl = params.get("callback_url") || "";
  const mode = params.get("mode") || "popup";
  const metadataStr = params.get("metadata") || "{}";

  const [step, setStep] = useState<CheckoutStep>("method");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [phoneInput, setPhoneInput] = useState(phone);
  const [emailInput, setEmailInput] = useState(email);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [pollCount, setPollCount] = useState(0);

  // Notify parent that checkout is ready
  useEffect(() => {
    postToParent({ type: "checkout.ready" });
  }, []);

  const initiatePayment = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      let metadata: Record<string, unknown> = {};
      try { metadata = JSON.parse(metadataStr); } catch { /* ignore */ }

      const baseUrl = window.location.origin;
      const res = await fetch(`${baseUrl}/api/v1/payments/sdk/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          method: selectedMethod,
          amount,
          currency,
          customerPhone: phoneInput || undefined,
          customerEmail: emailInput || undefined,
          customerName: name || undefined,
          description: description || undefined,
          idempotencyKey,
          metadata,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Payment initiation failed");
      }

      setTransactionId(data.data.transactionId);

      // For card payments, redirect to provider's hosted page
      if (data.data.redirectUrl) {
        if (mode === "redirect") {
          window.location.href = data.data.redirectUrl;
        } else {
          // Open in same iframe for card payments
          window.location.href = data.data.redirectUrl;
        }
        return;
      }

      // For M-Pesa STK Push, show processing and poll
      setStep("processing");
      startPolling(data.data.transactionId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Payment failed";
      setError(message);
      postToParent({ type: "payment.failed", message });
    } finally {
      setLoading(false);
    }
  }, [selectedMethod, amount, currency, phoneInput, emailInput, name, description, idempotencyKey, apiKey, metadataStr, mode]);

  const startPolling = useCallback((txId: string) => {
    let count = 0;
    const maxPolls = 20; // 60 seconds at 3s intervals

    const poll = async () => {
      count++;
      setPollCount(count);

      if (count > maxPolls) {
        setStep("failed");
        setError("Payment verification timed out. Please check your M-Pesa messages.");
        postToParent({ type: "payment.failed", message: "Timeout" });
        return;
      }

      try {
        const res = await fetch(`${window.location.origin}/api/v1/payments/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactionId: txId }),
        });
        const data = await res.json();

        if (data.data?.status === "COMPLETED") {
          setStep("success");
          postToParent({
            type: "payment.success",
            transactionId: txId,
            reference: idempotencyKey,
            status: "COMPLETED",
            amount,
            currency,
            method: selectedMethod,
          });

          if (mode === "redirect" && callbackUrl) {
            setTimeout(() => {
              window.location.href = `${callbackUrl}?reference=${idempotencyKey}&status=success&transactionId=${txId}`;
            }, 2000);
          }
          return;
        }

        if (data.data?.status === "FAILED") {
          setStep("failed");
          setError(data.data?.failureReason || "Payment failed");
          postToParent({ type: "payment.failed", message: "Payment failed" });
          return;
        }

        // Still pending, poll again
        setTimeout(poll, 3000);
      } catch {
        setTimeout(poll, 3000);
      }
    };

    setTimeout(poll, 3000);
  }, [amount, currency, idempotencyKey, selectedMethod, callbackUrl, mode]);

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setStep("details");
  };

  const handleClose = () => {
    postToParent({ type: "payment.close" });
  };

  const formatAmount = (amt: number) => {
    return new Intl.NumberFormat("en-KE").format(amt);
  };

  const methodOptions: { id: PaymentMethod; label: string; icon: typeof Smartphone; description: string }[] = [
    { id: "MPESA_STK", label: "M-Pesa", icon: Smartphone, description: "Pay with M-Pesa STK Push" },
    { id: "FLUTTERWAVE_CARD", label: "Card (Flutterwave)", icon: CreditCard, description: "Visa, Mastercard" },
    { id: "PAYSTACK_CARD", label: "Card (Paystack)", icon: CreditCard, description: "Visa, Mastercard" },
  ];

  const filteredMethods = methodOptions.filter((m) => allowedMethods.includes(m.id));

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="border-b px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-green-600" />
          <span className="font-bold text-lg">KastraPay</span>
        </div>
        {mode === "popup" && (
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-light"
          >
            &times;
          </button>
        )}
      </div>

      {/* Amount Display */}
      <div className="bg-gray-50 px-5 py-4 border-b">
        <p className="text-sm text-gray-500">Amount to pay</p>
        <p className="text-2xl font-bold">
          {currency} {formatAmount(amount)}
        </p>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>

      {/* Content */}
      <div className="flex-1 p-5">
        {/* Error Banner */}
        {error && step !== "failed" && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Step: Method Selection */}
        {step === "method" && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700 mb-3">Select payment method</p>
            {filteredMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => handleMethodSelect(method.id)}
                className="w-full flex items-center gap-3 p-4 border rounded-lg hover:border-gray-900 hover:bg-gray-50 transition-colors text-left"
              >
                <method.icon className="h-6 w-6 text-gray-600" />
                <div>
                  <p className="font-medium">{method.label}</p>
                  <p className="text-xs text-gray-500">{method.description}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step: Payment Details */}
        {step === "details" && selectedMethod && (
          <div className="space-y-4">
            <button
              onClick={() => setStep("method")}
              className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1"
            >
              &larr; Change method
            </button>

            {selectedMethod === "MPESA_STK" && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="phone">M-Pesa Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+254712345678"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    You&apos;ll receive an STK push prompt on this number
                  </p>
                </div>
              </div>
            )}

            {(selectedMethod === "FLUTTERWAVE_CARD" || selectedMethod === "PAYSTACK_CARD") && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    You&apos;ll be redirected to a secure payment page
                  </p>
                </div>
              </div>
            )}

            <Button
              onClick={initiatePayment}
              disabled={loading || (selectedMethod === "MPESA_STK" && !phoneInput) || ((selectedMethod === "FLUTTERWAVE_CARD" || selectedMethod === "PAYSTACK_CARD") && !emailInput)}
              className="w-full h-12 text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ${currency} ${formatAmount(amount)}`
              )}
            </Button>
          </div>
        )}

        {/* Step: Processing (M-Pesa STK) */}
        {step === "processing" && (
          <div className="text-center space-y-4 py-6">
            <div className="relative mx-auto w-16 h-16">
              <Loader2 className="h-16 w-16 animate-spin text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-lg">Waiting for M-Pesa</p>
              <p className="text-sm text-gray-500 mt-1">
                Check your phone for the STK push prompt and enter your M-Pesa PIN
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">
                Checking payment status... ({pollCount}/20)
              </p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div
                  className="bg-green-600 h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min((pollCount / 20) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step: Success */}
        {step === "success" && (
          <div className="text-center space-y-4 py-6">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
            <div>
              <p className="font-semibold text-lg">Payment Successful!</p>
              <p className="text-sm text-gray-500 mt-1">
                Your payment of {currency} {formatAmount(amount)} has been received.
              </p>
            </div>
            {transactionId && (
              <p className="text-xs text-gray-400 font-mono">{transactionId}</p>
            )}
            {mode === "popup" && (
              <Button onClick={handleClose} variant="outline" className="mt-4">
                Close
              </Button>
            )}
          </div>
        )}

        {/* Step: Failed */}
        {step === "failed" && (
          <div className="text-center space-y-4 py-6">
            <XCircle className="h-16 w-16 text-red-500 mx-auto" />
            <div>
              <p className="font-semibold text-lg">Payment Failed</p>
              <p className="text-sm text-gray-500 mt-1">{error || "Something went wrong"}</p>
            </div>
            <Button
              onClick={() => {
                setStep("method");
                setError("");
              }}
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t px-5 py-3 text-center">
        <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
          <ShieldCheck className="h-3 w-3" />
          Secured by KastraPay
        </div>
      </div>
    </div>
  );
}
