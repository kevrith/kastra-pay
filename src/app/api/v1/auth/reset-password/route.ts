export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validators/auth";
import { handleApiError, ValidationError } from "@/lib/errors";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = resetPasswordSchema.parse(body);

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken || verificationToken.expires < new Date()) {
      throw new ValidationError("Invalid or expired reset token");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { passwordHash },
    });

    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationToken.identifier,
          token,
        },
      },
    });

    return Response.json({
      success: true,
      data: { message: "Password reset successfully" },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
