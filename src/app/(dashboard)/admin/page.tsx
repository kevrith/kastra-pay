export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { Users, Building2, CreditCard, TrendingUp } from "lucide-react";

export default async function AdminDashboard() {
  const [
    totalRevenue,
    totalTransactions,
    completedCount,
    pendingCount,
    merchantCount,
    userCount,
  ] = await Promise.all([
    prisma.transaction.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true },
    }),
    prisma.transaction.count(),
    prisma.transaction.count({ where: { status: "COMPLETED" } }),
    prisma.transaction.count({
      where: { status: { in: ["PENDING", "PROCESSING"] } },
    }),
    prisma.merchant.count(),
    prisma.user.count(),
  ]);

  const revenue = Number(totalRevenue._sum.amount || 0);
  const successRate =
    totalTransactions > 0 ? (completedCount / totalTransactions) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform-wide overview</p>
      </div>

      <StatsCards
        totalRevenue={revenue}
        totalTransactions={totalTransactions}
        successRate={successRate}
        pendingCount={pendingCount}
      />

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Merchants</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{merchantCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Platform GMV
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KES {revenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
