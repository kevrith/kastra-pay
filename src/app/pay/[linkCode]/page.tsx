export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

interface PayPageProps {
  params: Promise<{ linkCode: string }>;
}

export default async function PayPage({ params }: PayPageProps) {
  const { linkCode } = await params;

  const paymentLink = await prisma.paymentLink.findUnique({
    where: { code: linkCode },
    include: {
      merchant: { select: { slug: true, status: true } },
    },
  });

  if (!paymentLink || paymentLink.merchant.status !== "ACTIVE") {
    notFound();
  }

  if (paymentLink.status !== "ACTIVE") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Payment Link Inactive</h1>
          <p className="text-muted-foreground">
            This payment link is no longer active.
          </p>
        </div>
      </div>
    );
  }

  redirect(`/checkout/${paymentLink.merchant.slug}/${paymentLink.id}`);
}
