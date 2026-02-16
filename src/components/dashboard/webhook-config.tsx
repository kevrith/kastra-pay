"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Webhook, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export function WebhookConfig() {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetch("/api/v1/merchants/webhook")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setWebhookUrl(data.data.webhookUrl || "");
          setWebhookSecret(data.data.webhookSecret || "");
        }
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  async function handleSave() {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/merchants/webhook", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrl, webhookSecret }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error?.message || "Failed to save webhook config");
        return;
      }

      toast.success("Webhook configuration saved");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="h-5 w-5" />
          Webhook Configuration
        </CardTitle>
        <CardDescription>
          Configure a webhook URL to receive real-time payment notifications on your server
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="webhookUrl">Webhook URL</Label>
          <Input
            id="webhookUrl"
            type="url"
            placeholder="https://your-site.com/api/kastrapay-webhook"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            We&apos;ll send POST requests to this URL when payment events occur
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="webhookSecret">Webhook Secret</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="webhookSecret"
                type={showSecret ? "text" : "password"}
                placeholder="Your webhook signing secret"
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowSecret(!showSecret)}
              >
                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                const secret = `whsec_${crypto.randomUUID().replace(/-/g, "")}`;
                setWebhookSecret(secret);
                setShowSecret(true);
              }}
            >
              Generate
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Used to sign webhook payloads with HMAC-SHA256 so you can verify authenticity
          </p>
        </div>

        <Button onClick={handleSave} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Webhook Settings
        </Button>
      </CardContent>
    </Card>
  );
}
