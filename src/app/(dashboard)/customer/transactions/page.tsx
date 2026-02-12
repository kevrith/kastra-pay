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
import { PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { format } from "date-fns";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  COMPLETED: "default",
  PENDING: "outline",
  PROCESSING: "secondary",
  FAILED: "destructive",
  CANCELLED: "destructive",
  REVERSED: "secondary",
};

export default async function CustomerTransactionsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const transactions = await prisma.transaction.findMany({
    where: { customerId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      amount: true,
      currency: true,
      status: true,
      paymentMethod: true,
      description: true,
      mpesaReceiptNumber: true,
      createdAt: true,
      merchant: {
        select: { businessName: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Transactions</h1>
        <p className="text-muted-foreground">Your complete payment history</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Merchant</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">
                            {tx.merchant.businessName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {tx.description || "-"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {PAYMENT_METHOD_LABELS[tx.paymentMethod] || tx.paymentMethod}
                      </TableCell>
                      <TableCell className="font-medium">
                        {tx.currency} {Number(tx.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[tx.status] || "outline"}>
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {tx.mpesaReceiptNumber || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(tx.createdAt), "MMM d, yyyy HH:mm")}
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
