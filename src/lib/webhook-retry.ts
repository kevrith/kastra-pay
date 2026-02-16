import { prisma } from "@/lib/prisma";

interface WebhookDeliveryConfig {
  url: string;
  payload: Record<string, unknown>;
  secret?: string;
  maxRetries?: number;
}

interface WebhookDeliveryResult {
  success: boolean;
  statusCode?: number;
  error?: string;
  attempts: number;
}

/**
 * Enterprise-grade webhook delivery with exponential backoff retry.
 *
 * Retry schedule (base delay * 2^attempt):
 * - Attempt 1: immediate
 * - Attempt 2: ~2s
 * - Attempt 3: ~4s
 * - Attempt 4: ~8s
 * - Attempt 5: ~16s
 */
export async function deliverWebhook(
  config: WebhookDeliveryConfig
): Promise<WebhookDeliveryResult> {
  const maxRetries = config.maxRetries ?? 5;
  const baseDelay = 2000; // 2 seconds
  let lastError = "";
  let lastStatusCode: number | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Exponential backoff (skip delay on first attempt)
      if (attempt > 0) {
        const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "User-Agent": "KastraPay-Webhook/1.0",
        "X-KastraPay-Delivery": crypto.randomUUID(),
        "X-KastraPay-Retry": String(attempt),
      };

      // Add HMAC signature if secret is provided
      if (config.secret) {
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
          "raw",
          encoder.encode(config.secret),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"]
        );
        const body = JSON.stringify(config.payload);
        const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
        const hex = Array.from(new Uint8Array(signature))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        headers["X-KastraPay-Signature"] = `sha256=${hex}`;
      }

      const response = await fetch(config.url, {
        method: "POST",
        headers,
        body: JSON.stringify(config.payload),
        signal: AbortSignal.timeout(10000), // 10s timeout
      });

      lastStatusCode = response.status;

      if (response.ok) {
        return {
          success: true,
          statusCode: response.status,
          attempts: attempt + 1,
        };
      }

      // Don't retry 4xx errors (except 429)
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        return {
          success: false,
          statusCode: response.status,
          error: `HTTP ${response.status}`,
          attempts: attempt + 1,
        };
      }

      lastError = `HTTP ${response.status}`;
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Unknown error";
    }
  }

  return {
    success: false,
    statusCode: lastStatusCode,
    error: lastError,
    attempts: maxRetries,
  };
}

/**
 * Deliver a webhook for a merchant's transaction event and log it.
 */
export async function deliverMerchantWebhook(params: {
  merchantId: string;
  event: string;
  transactionId: string;
  payload: Record<string, unknown>;
}) {
  // Look up merchant webhook URL from settings
  const merchant = await prisma.merchant.findUnique({
    where: { id: params.merchantId },
    select: { webhookUrl: true, webhookSecret: true, businessName: true },
  });

  if (!merchant?.webhookUrl) return;

  const webhookPayload = {
    event: params.event,
    timestamp: new Date().toISOString(),
    data: {
      transactionId: params.transactionId,
      ...params.payload,
    },
  };

  const result = await deliverWebhook({
    url: merchant.webhookUrl,
    payload: webhookPayload,
    secret: merchant.webhookSecret || undefined,
  });

  // Log the webhook delivery attempt
  await prisma.webhookEvent.create({
    data: {
      merchantId: params.merchantId,
      provider: "kastrapay",
      eventType: params.event,
      payload: webhookPayload as object,
      status: result.success ? "DELIVERED" : "FAILED",
      attempts: result.attempts,
    },
  }).catch(() => {
    // Non-blocking: don't fail if logging fails
  });

  return result;
}
