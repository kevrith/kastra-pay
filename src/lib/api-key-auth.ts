import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

interface ApiKeyAuthResult {
  success: boolean;
  merchantId?: string;
  error?: string;
}

/**
 * Validates an API key from the Authorization header.
 * Supports: `Authorization: Bearer kp_live_xxxxx`
 * Returns the associated merchantId if valid.
 */
export async function validateApiKey(req: NextRequest): Promise<ApiKeyAuthResult> {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { success: false, error: "Missing or invalid Authorization header" };
  }

  const rawKey = authHeader.slice(7); // Remove "Bearer "

  if (!rawKey.startsWith("kp_")) {
    return { success: false, error: "Invalid API key format" };
  }

  const keyHash = hashApiKey(rawKey);

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: {
      merchant: {
        select: { id: true, status: true },
      },
    },
  });

  if (!apiKey) {
    return { success: false, error: "Invalid API key" };
  }

  if (!apiKey.isActive) {
    return { success: false, error: "API key has been revoked" };
  }

  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return { success: false, error: "API key has expired" };
  }

  if (apiKey.merchant.status !== "ACTIVE") {
    return { success: false, error: "Merchant account is not active" };
  }

  // Update last used timestamp (non-blocking)
  prisma.apiKey
    .update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    })
    .catch(() => {});

  return {
    success: true,
    merchantId: apiKey.merchant.id,
  };
}
