export const dynamic = 'force-dynamic';

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

export default async function RefundsPage() {
  const session = await auth();
  if (!session?.user?.merchantId) {
    redirect("/merchant/settings");
  }

  const refunds = await prisma.refund.findMany({
    where: { merchantId: session.user.merchantId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      transaction: {
        select: {
          paymentMethod: true,
          customerName: true,
          customerEmail: true,
          currency: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Refunds</h1>
        <p className="text-muted-foreground">View and manage payment refunds</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Refunds</CardTitle>
        </CardHeader>
        <CardContent>
          {refunds.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No refunds yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {refunds.map((refund) => (
                    <TableRow key={refund.id}>
                      <TableCell>
                        <p className="font-medium text-sm">
                          {refund.transaction.customerName || "Guest"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {refund.transaction.customerEmail || "-"}
                        </p>
                      </TableCell>
                      <TableCell className="font-medium">
                        {refund.transaction.currency}{" "}
                        {Number(refund.amount).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm">
                        {refund.reason || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[refund.status] || "outline"}>
                          {refund.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(refund.createdAt), "MMM d, yyyy HH:mm")}
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
