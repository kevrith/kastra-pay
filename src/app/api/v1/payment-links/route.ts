export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError, AuthenticationError } from "@/lib/errors";
import { z } from "zod";

const createPaymentLinkSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  amount: z.number().positive().optional(),
  currency: z.string().default("KES"),
  maxPayments: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.merchantId) {
      throw new AuthenticationError();
    }

    const links = await prisma.paymentLink.findMany({
      where: { merchantId: session.user.merchantId },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({
      success: true,
      data: links.map((l) => ({
        ...l,
        amount: l.amount ? Number(l.amount) : null,
        createdAt: l.createdAt.toISOString(),
        updatedAt: l.updatedAt.toISOString(),
        expiresAt: l.expiresAt?.toISOString() || null,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.merchantId) {
      throw new AuthenticationError();
    }

    const body = await request.json();
    const data = createPaymentLinkSchema.parse(body);

    const link = await prisma.paymentLink.create({
      data: {
        merchantId: session.user.merchantId,
        code: nanoid(8),
        title: data.title,
        description: data.description,
        amount: data.amount,
        currency: data.currency,
        maxPayments: data.maxPayments,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });

    return Response.json(
      {
        success: true,
        data: {
          ...link,
          amount: link.amount ? Number(link.amount) : null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
