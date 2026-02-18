export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
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
import { SettlementActions } from "@/components/dashboard/settlement-actions";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  COMPLETED: "default",
  PENDING: "outline",
  PROCESSING: "secondary",
  FAILED: "destructive",
};

export default async function AdminSettlementsPage() {
  const [settlements, stats] = await Promise.all([
    prisma.settlement.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        merchant: { select: { businessName: true, slug: true } },
      },
    }),
    Promise.all([
      prisma.settlement.count({ where: { status: "PENDING" } }),
      prisma.settlement.count({ where: { status: "PROCESSING" } }),
      prisma.settlement.count({ where: { status: "COMPLETED" } }),
      prisma.settlement.count({ where: { status: "FAILED" } }),
      prisma.settlement.aggregate({
        where: { status: "COMPLETED" },
        _sum: { netAmount: true, platformFee: true },
      }),
    ]),
  ]);

  const [pending, processing, completed, failed, totals] = stats;
  const totalSettled = Number(totals._sum.netAmount || 0);
  const totalFees = Number(totals._sum.platformFee || 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settlements</h1>
        <p className="text-muted-foreground">
          Manage merchant payouts and settlement cycles
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Processing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processing}</div>
          </CardContent>
        </Card>
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
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Platform Fees Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KES {Number(totalFees).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Run settlement + status */}
      <SettlementActions failedCount={failed} />

      {/* Settlements table */}
      <Card>
        <CardHeader>
          <CardTitle>Settlement History</CardTitle>
        </CardHeader>
        <CardContent>
          {settlements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No settlements yet. Settlements will appear here when the daily
              settlement cycle runs.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Merchant</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead>Gross</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Net</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settlements.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">
                        {s.merchant.businessName}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(s.periodStart), "MMM d")} –{" "}
                        {format(new Date(s.periodEnd), "MMM d")}
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
                        {format(new Date(s.createdAt), "MMM d, yyyy HH:mm")}
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
