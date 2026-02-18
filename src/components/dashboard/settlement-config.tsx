"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

interface SettlementData {
  settlementBankCode: string;
  settlementAccountNo: string;
  settlementAccountName: string;
  settlementBankName: string;
  mpesaB2CPhone: string;
  settlementFrequency: string;
}

export function SettlementConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<SettlementData>({
    settlementBankCode: "",
    settlementAccountNo: "",
    settlementAccountName: "",
    settlementBankName: "",
    mpesaB2CPhone: "",
    settlementFrequency: "WEEKLY",
  });

  useEffect(() => {
    fetch("/api/v1/merchants/settlement")
      .then((res) => res.json())
      .then((d) => {
        if (d.settlementFrequency) {
          setData(d);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/v1/merchants/settlement", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to save settlement config");
        return;
      }

      toast.success("Settlement configuration saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settlement Configuration</CardTitle>
        <CardDescription>
          Configure how and when you receive your payouts. Bank transfers are
          used for Paystack/Flutterwave payments, and M-Pesa B2C for M-Pesa
          payments.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Settlement Frequency */}
        <div className="space-y-2">
          <Label>Settlement Frequency</Label>
          <Select
            value={data.settlementFrequency}
            onValueChange={(v) => setData({ ...data, settlementFrequency: v })}
          >
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAILY">Daily</SelectItem>
              <SelectItem value="WEEKLY">Weekly</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bank Details */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Bank Account (for card payment settlements)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Bank Name</Label>
              <Input
                placeholder="e.g. Equity Bank"
                value={data.settlementBankName}
                onChange={(e) =>
                  setData({ ...data, settlementBankName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Bank Code</Label>
              <Input
                placeholder="e.g. 054"
                value={data.settlementBankCode}
                onChange={(e) =>
                  setData({ ...data, settlementBankCode: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Account Number</Label>
              <Input
                placeholder="e.g. 1234567890"
                value={data.settlementAccountNo}
                onChange={(e) =>
                  setData({ ...data, settlementAccountNo: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Account Name</Label>
              <Input
                placeholder="e.g. My Business Ltd"
                value={data.settlementAccountName}
                onChange={(e) =>
                  setData({ ...data, settlementAccountName: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* M-Pesa B2C Phone */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">M-Pesa Settlement</h4>
          <div className="space-y-2 max-w-sm">
            <Label>M-Pesa Phone Number</Label>
            <Input
              placeholder="+254712345678"
              value={data.mpesaB2CPhone}
              onChange={(e) =>
                setData({ ...data, mpesaB2CPhone: e.target.value })
              }
            />
            <p className="text-xs text-muted-foreground">
              M-Pesa payments will be settled to this number via B2C transfer.
            </p>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Settlement Config
        </Button>
      </CardContent>
    </Card>
  );
}
