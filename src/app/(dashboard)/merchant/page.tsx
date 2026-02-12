export const dynamic = 'force-dynamic';

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";

export default async function MerchantDashboard() {
  const session = await auth();
  if (!session?.user?.merchantId) {
    redirect("/merchant/settings");
  }

  const merchantId = session.user.merchantId;

  const [totalRevenue, totalTransactions, completedCount, pendingCount, recentTransactions] =
    await Promise.all([
      prisma.transaction.aggregate({
        where: { merchantId, status: "COMPLETED" },
        _sum: { amount: true },
      }),
      prisma.transaction.count({ where: { merchantId } }),
      prisma.transaction.count({ where: { merchantId, status: "COMPLETED" } }),
      prisma.transaction.count({
        where: { merchantId, status: { in: ["PENDING", "PROCESSING"] } },
      }),
      prisma.transaction.findMany({
        where: { merchantId },
        orderBy: { createdAt: "desc" },
        take: 10,
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
      }),
    ]);

  const revenue = Number(totalRevenue._sum.amount || 0);
  const successRate = totalTransactions > 0 ? (completedCount / totalTransactions) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your payment activity</p>
      </div>

      <StatsCards
        totalRevenue={revenue}
        totalTransactions={totalTransactions}
        successRate={successRate}
        pendingCount={pendingCount}
      />

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest payment activity</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentTransactions
            transactions={recentTransactions.map((tx) => ({
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
