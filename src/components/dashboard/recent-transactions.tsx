"use client";

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

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  customerName: string | null;
  customerEmail: string | null;
  createdAt: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  COMPLETED: "default",
  PENDING: "outline",
  PROCESSING: "secondary",
  FAILED: "destructive",
  CANCELLED: "destructive",
  REVERSED: "secondary",
};

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No transactions yet. Create a payment link to start accepting payments.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell>
              <div>
                <p className="font-medium text-sm">
                  {tx.customerName || "Guest"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {tx.customerEmail || "-"}
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
              {format(new Date(tx.createdAt), "MMM d, HH:mm")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
