"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Copy, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface PaymentLink {
  id: string;
  code: string;
  title: string;
  description: string | null;
  amount: number | null;
  currency: string;
  status: string;
  paymentCount: number;
  maxPayments: number | null;
  createdAt: string;
}

export default function PaymentLinksPage() {
  const { data: session } = useSession();
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const fetchLinks = useCallback(async () => {
    if (!session?.user?.merchantId) return;
    try {
      const res = await fetch("/api/v1/payment-links");
      const data = await res.json();
      if (data.success) setLinks(data.data);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.merchantId]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  async function handleCreate() {
    if (!title) return;
    setIsCreating(true);
    try {
      const res = await fetch("/api/v1/payment-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || undefined,
          amount: amount ? Number(amount) : undefined,
          currency: "KES",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Payment link created!");
        setDialogOpen(false);
        setTitle("");
        setDescription("");
        setAmount("");
        fetchLinks();
      } else {
        toast.error(data.error?.message || "Failed to create link");
      }
    } finally {
      setIsCreating(false);
    }
  }

  function copyLink(code: string) {
    const url = `${window.location.origin}/pay/${code}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Links</h1>
          <p className="text-muted-foreground">
            Create and manage shareable payment links
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Payment Link</DialogTitle>
              <DialogDescription>
                Generate a shareable link for accepting payments
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  placeholder="e.g., Product Payment"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <Label>Description (optional)</Label>
                <Input
                  placeholder="Brief description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div>
                <Label>Amount (KES) — leave empty for customer to enter</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <Button
                onClick={handleCreate}
                className="w-full"
                disabled={!title || isCreating}
              >
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Link
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Payment Links</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : links.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payment links yet. Create one to start accepting payments.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payments</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {links.map((link) => (
                    <TableRow key={link.id}>
                      <TableCell className="font-medium">{link.title}</TableCell>
                      <TableCell>
                        {link.amount
                          ? `${link.currency} ${Number(link.amount).toLocaleString()}`
                          : "Variable"}
                      </TableCell>
                      <TableCell>
                        {link.paymentCount}
                        {link.maxPayments ? ` / ${link.maxPayments}` : ""}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            link.status === "ACTIVE" ? "default" : "secondary"
                          }
                        >
                          {link.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(link.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyLink(link.code)}
                            title="Copy link"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            title="Open link"
                          >
                            <a
                              href={`/pay/${link.code}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
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
