export const dynamic = 'force-dynamic';

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
import { MerchantActions } from "@/components/admin/merchant-actions";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ACTIVE: "default",
  PENDING: "outline",
  SUSPENDED: "destructive",
  DEACTIVATED: "secondary",
};

export default async function AdminMerchantsPage() {
  const merchants = await prisma.merchant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { transactions: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Merchants</h1>
        <p className="text-muted-foreground">Manage platform merchants</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Merchants</CardTitle>
        </CardHeader>
        <CardContent>
          {merchants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No merchants registered yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {merchants.map((merchant) => (
                    <TableRow key={merchant.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{merchant.businessName}</p>
                          <p className="text-xs text-muted-foreground">
                            {merchant.businessEmail}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{merchant.user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {merchant.user.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={statusVariant[merchant.status] || "outline"}
                        >
                          {merchant.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{merchant._count.transactions}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(merchant.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <MerchantActions
                          merchantId={merchant.id}
                          currentStatus={merchant.status}
                        />
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
