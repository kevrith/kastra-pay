export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { merchantOnboardingSchema } from "@/lib/validators/merchant";
import { handleApiError, AuthenticationError, ConflictError } from "@/lib/errors";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new AuthenticationError();
    }

    const body = await request.json();
    const data = merchantOnboardingSchema.parse(body);

    // Check if user already has a merchant profile
    const existing = await prisma.merchant.findUnique({
      where: { userId: session.user.id },
    });

    if (existing) {
      throw new ConflictError("You already have a merchant profile");
    }

    // Generate unique slug
    let slug = slugify(data.businessName);
    const slugExists = await prisma.merchant.findUnique({ where: { slug } });
    if (slugExists) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const merchant = await prisma.merchant.create({
      data: {
        userId: session.user.id,
        businessName: data.businessName,
        slug,
        businessEmail: data.businessEmail,
        businessPhone: data.businessPhone || null,
        description: data.description || null,
        website: data.website || null,
        settlementEmail: data.settlementEmail || null,
        settlementPhone: data.settlementPhone || null,
        settlementBankCode: data.settlementBankCode || null,
        settlementAccountNo: data.settlementAccountNo || null,
        status: "PENDING",
      },
    });

    // Update user role to MERCHANT if not already
    if (session.user.role !== "MERCHANT") {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { role: "MERCHANT" },
      });
    }

    return Response.json(
      { success: true, data: { merchant } },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
