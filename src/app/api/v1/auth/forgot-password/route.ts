export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validators/auth";
import { handleApiError } from "@/lib/errors";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 3600000); // 1 hour

      await prisma.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires,
        },
      });

      // TODO: Send email with reset link using Resend
      // For now, log the token in development
      if (process.env.NODE_ENV === "development") {
        console.log(`Password reset token for ${email}: ${token}`);
      }
    }

    // Always return success to prevent email enumeration
    return Response.json({
      success: true,
      data: { message: "If an account exists, a reset link has been sent." },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
