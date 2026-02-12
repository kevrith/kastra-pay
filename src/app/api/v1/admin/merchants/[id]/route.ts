export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/errors";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH - Update merchant status (approve, suspend, deactivate)
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: { message: "Unauthorized" } },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!["ACTIVE", "SUSPENDED", "DEACTIVATED", "PENDING"].includes(status)) {
      return NextResponse.json(
        { error: { message: "Invalid status. Must be ACTIVE, SUSPENDED, DEACTIVATED, or PENDING" } },
        { status: 400 }
      );
    }

    const merchant = await prisma.merchant.findUnique({
      where: { id },
    });

    if (!merchant) {
      return NextResponse.json(
        { error: { message: "Merchant not found" } },
        { status: 404 }
      );
    }

    const updated = await prisma.merchant.update({
      where: { id },
      data: { status },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: status === "ACTIVE" ? "MERCHANT_APPROVED" : "MERCHANT_SUSPENDED",
        entity: "Merchant",
        entityId: id,
        oldValue: { status: merchant.status } as object,
        newValue: { status } as object,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        businessName: updated.businessName,
        status: updated.status,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
