export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CheckoutForm } from "@/components/checkout/checkout-form";

interface CheckoutPageProps {
  params: Promise<{
    merchantSlug: string;
    paymentLinkId: string;
  }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { merchantSlug, paymentLinkId } = await params;

  const merchant = await prisma.merchant.findUnique({
    where: { slug: merchantSlug },
    select: {
      id: true,
      businessName: true,
      logo: true,
      status: true,
    },
  });

  if (!merchant || merchant.status !== "ACTIVE") {
    notFound();
  }

  const paymentLink = await prisma.paymentLink.findUnique({
    where: { id: paymentLinkId },
    select: {
      id: true,
      title: true,
      description: true,
      amount: true,
      currency: true,
      status: true,
      maxPayments: true,
      paymentCount: true,
      expiresAt: true,
    },
  });

  if (!paymentLink || paymentLink.status !== "ACTIVE") {
    notFound();
  }

  if (paymentLink.expiresAt && paymentLink.expiresAt < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Payment Link Expired</h1>
          <p className="text-muted-foreground">
            This payment link has expired. Please contact the merchant.
          </p>
        </div>
      </div>
    );
  }

  if (
    paymentLink.maxPayments &&
    paymentLink.paymentCount >= paymentLink.maxPayments
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Payment Link Inactive</h1>
          <p className="text-muted-foreground">
            This payment link has reached its maximum number of payments.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-8">
      <CheckoutForm
        merchantId={merchant.id}
        merchantName={merchant.businessName}
        amount={paymentLink.amount ? Number(paymentLink.amount) : null}
        currency={paymentLink.currency}
        title={paymentLink.title}
        description={paymentLink.description || undefined}
        paymentLinkId={paymentLink.id}
      />
    </div>
  );
}
