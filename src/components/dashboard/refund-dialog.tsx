"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RefreshCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RefundDialogProps {
  transactionId: string;
  maxAmount: number;
  currency: string;
  customerName: string;
}

export function RefundDialog({
  transactionId,
  maxAmount,
  currency,
  customerName,
}: RefundDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(maxAmount));
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleRefund() {
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!reason.trim()) {
      toast.error("Please provide a reason for the refund");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/payments/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId,
          amount: Number(amount),
          reason,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error?.message || "Refund failed");
        return;
      }

      toast.success("Refund processed successfully");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Refund">
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Initiate Refund</DialogTitle>
          <DialogDescription>
            Refund payment to {customerName || "customer"}. Max refundable: {currency} {maxAmount.toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>Amount ({currency})</Label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              max={maxAmount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <Label>Reason</Label>
            <Input
              placeholder="Reason for refund..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleRefund} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Process Refund
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
