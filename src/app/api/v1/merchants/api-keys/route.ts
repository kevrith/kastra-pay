export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiKeyCreateSchema } from "@/lib/validators/merchant";
import { handleApiError } from "@/lib/errors";
import { nanoid } from "nanoid";
import crypto from "crypto";

function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

// GET - List API keys for the merchant
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.merchantId) {
      return NextResponse.json(
        { error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: { merchantId: session.user.merchantId },
      select: {
        id: true,
        name: true,
        lastFour: true,
        isActive: true,
        lastUsedAt: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: apiKeys });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Create a new API key
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.merchantId) {
      return NextResponse.json(
        { error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validated = apiKeyCreateSchema.parse(body);

    // Generate a secure API key
    const rawKey = `kp_live_${nanoid(32)}`;
    const hashedKey = hashApiKey(rawKey);
    const lastFour = rawKey.slice(-4);

    const apiKey = await prisma.apiKey.create({
      data: {
        merchantId: session.user.merchantId,
        name: validated.name,
        key: hashedKey,
        lastFour,
        expiresAt: null,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "API_KEY_CREATE",
        resource: "ApiKey",
        resourceId: apiKey.id,
        details: { name: validated.name } as object,
      },
    });

    // Return the raw key only once - it won't be retrievable after this
    return NextResponse.json({
      success: true,
      data: {
        id: apiKey.id,
        name: apiKey.name,
        key: rawKey,
        lastFour,
        createdAt: apiKey.createdAt,
        expiresAt: apiKey.expiresAt,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE - Revoke an API key
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.merchantId) {
      return NextResponse.json(
        { error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const keyId = searchParams.get("id");

    if (!keyId) {
      return NextResponse.json(
        { error: { message: "API key ID is required" } },
        { status: 400 }
      );
    }

    const apiKey = await prisma.apiKey.findUnique({
      where: { id: keyId },
    });

    if (!apiKey || apiKey.merchantId !== session.user.merchantId) {
      return NextResponse.json(
        { error: { message: "API key not found" } },
        { status: 404 }
      );
    }

    await prisma.apiKey.update({
      where: { id: keyId },
      data: { isActive: false },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "API_KEY_REVOKE",
        resource: "ApiKey",
        resourceId: keyId,
        details: { name: apiKey.name } as object,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
