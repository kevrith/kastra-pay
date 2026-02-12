export const dynamic = 'force-dynamic';

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionsTable } from "@/components/dashboard/transactions-table";

export default async function TransactionsPage() {
  const session = await auth();
  if (!session?.user?.merchantId) {
    redirect("/merchant/settings");
  }

  const transactions = await prisma.transaction.findMany({
    where: { merchantId: session.user.merchantId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      amount: true,
      currency: true,
      status: true,
      paymentMethod: true,
      customerName: true,
      customerEmail: true,
      customerPhone: true,
      mpesaReceiptNumber: true,
      description: true,
      createdAt: true,
      completedAt: true,
    },
  });

  // Serialize for client component
  const serialized = transactions.map((tx) => ({
    id: tx.id,
    amount: Number(tx.amount),
    currency: tx.currency,
    status: tx.status,
    paymentMethod: tx.paymentMethod,
    customerName: tx.customerName,
    customerEmail: tx.customerEmail,
    customerPhone: tx.customerPhone,
    mpesaReceiptNumber: tx.mpesaReceiptNumber,
    createdAt: tx.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transactions</h1>
        <p className="text-muted-foreground">View all your payment transactions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {serialized.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions yet.
            </div>
          ) : (
            <TransactionsTable transactions={serialized} showRefund />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
