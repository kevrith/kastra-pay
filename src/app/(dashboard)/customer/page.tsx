export const dynamic = 'force-dynamic';

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";

export default async function CustomerDashboard() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const transactions = await prisma.transaction.findMany({
    where: { customerId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      amount: true,
      currency: true,
      status: true,
      paymentMethod: true,
      customerName: true,
      customerEmail: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <p className="text-muted-foreground">Your payment activity</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your payment history</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentTransactions
            transactions={transactions.map((tx) => ({
              ...tx,
              amount: Number(tx.amount),
              createdAt: tx.createdAt.toISOString(),
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
