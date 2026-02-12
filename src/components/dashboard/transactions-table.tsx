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
import { RefundDialog } from "./refund-dialog";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  COMPLETED: "default",
  PENDING: "outline",
  PROCESSING: "secondary",
  FAILED: "destructive",
  CANCELLED: "destructive",
  REVERSED: "secondary",
};

interface TransactionRow {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  mpesaReceiptNumber: string | null;
  createdAt: string;
}

interface TransactionsTableProps {
  transactions: TransactionRow[];
  showRefund?: boolean;
}

export function TransactionsTable({ transactions, showRefund = false }: TransactionsTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Receipt</TableHead>
            <TableHead>Date</TableHead>
            {showRefund && <TableHead>Actions</TableHead>}
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
                    {tx.customerEmail || tx.customerPhone || "-"}
                  </p>
                </div>
              </TableCell>
              <TableCell className="text-sm">
                {PAYMENT_METHOD_LABELS[tx.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS] || tx.paymentMethod}
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
              {showRefund && (
                <TableCell>
                  {tx.status === "COMPLETED" && (
                    <RefundDialog
                      transactionId={tx.id}
                      maxAmount={Number(tx.amount)}
                      currency={tx.currency}
                      customerName={tx.customerName || "Guest"}
                    />
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
