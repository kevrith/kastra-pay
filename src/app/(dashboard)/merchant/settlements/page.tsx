export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  COMPLETED: "default",
  PENDING: "outline",
  PROCESSING: "secondary",
  FAILED: "destructive",
};

export default async function MerchantSettlementsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const merchant = await prisma.merchant.findUnique({
    where: { userId: session.user.id },
    select: { id: true, settlementFrequency: true, commissionRate: true },
  });

  if (!merchant) redirect("/merchant");

  const settlements = await prisma.settlement.findMany({
    where: { merchantId: merchant.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const totals = await prisma.settlement.aggregate({
    where: { merchantId: merchant.id, status: "COMPLETED" },
    _sum: { netAmount: true },
    _count: true,
  });

  const totalSettled = Number(totals._sum.netAmount || 0);
  const pendingSettlements = settlements.filter((s) => s.status === "PENDING" || s.status === "PROCESSING");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settlements</h1>
        <p className="text-muted-foreground">
          Track your payouts — settled {merchant.settlementFrequency.toLowerCase()} with a{" "}
          {merchant.commissionRate
            ? `${Number(merchant.commissionRate) * 100}%`
            : "2.5%"}{" "}
          platform fee.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Settled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KES {Number(totalSettled).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              across {totals._count} settlement{totals._count !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Payouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingSettlements.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Settlement Frequency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {merchant.settlementFrequency.toLowerCase()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Settlement History</CardTitle>
        </CardHeader>
        <CardContent>
          {settlements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No settlements yet. Payouts are processed automatically based on
              your settlement frequency.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead>Gross</TableHead>
                    <TableHead>Platform Fee</TableHead>
                    <TableHead>Net Payout</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settlements.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="text-sm">
                        {format(new Date(s.periodStart), "MMM d")} –{" "}
                        {format(new Date(s.periodEnd), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>{s.transactionCount}</TableCell>
                      <TableCell>
                        {s.currency} {Number(s.amount).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {s.currency} {Number(s.platformFee).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {s.currency} {Number(s.netAmount).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm">
                        {s.paymentMethod.replace(/_/g, " ")}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[s.status] || "outline"}>
                          {s.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(s.createdAt), "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
