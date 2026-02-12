"use client";

import { cn } from "@/lib/utils";
import { Smartphone, CreditCard } from "lucide-react";

type Method = "MPESA_STK" | "FLUTTERWAVE_CARD" | "PAYSTACK_CARD";

interface PaymentMethodSelectorProps {
  selected: Method;
  onSelect: (method: Method) => void;
}

const methods = [
  {
    id: "MPESA_STK" as const,
    label: "M-Pesa",
    description: "Pay with M-Pesa STK Push",
    icon: Smartphone,
  },
  {
    id: "FLUTTERWAVE_CARD" as const,
    label: "Card (Flutterwave)",
    description: "Visa / Mastercard",
    icon: CreditCard,
  },
  {
    id: "PAYSTACK_CARD" as const,
    label: "Card (Paystack)",
    description: "Visa / Mastercard",
    icon: CreditCard,
  },
];

export function PaymentMethodSelector({
  selected,
  onSelect,
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Payment Method</label>
      <div className="grid gap-3">
        {methods.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => onSelect(method.id)}
            className={cn(
              "flex items-center gap-4 rounded-lg border p-4 text-left transition-colors",
              selected === method.id
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-muted/50"
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                selected === method.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <method.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-sm">{method.label}</p>
              <p className="text-xs text-muted-foreground">
                {method.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
