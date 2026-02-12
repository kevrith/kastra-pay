"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Plus, Copy, Trash2, Loader2, Key, Check } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface ApiKeyData {
  id: string;
  name: string;
  lastFour: string;
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
  expiresAt: string | null;
}

export function ApiKeysManager() {
  const [keys, setKeys] = useState<ApiKeyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchKeys();
  }, []);

  async function fetchKeys() {
    try {
      const res = await fetch("/api/v1/merchants/api-keys");
      const data = await res.json();
      if (data.success) {
        setKeys(data.data);
      }
    } catch {
      toast.error("Failed to load API keys");
    } finally {
      setIsLoading(false);
    }
  }

  async function createKey() {
    if (!newKeyName.trim()) {
      toast.error("Please enter a name for the key");
      return;
    }
    setIsCreating(true);
    try {
      const res = await fetch("/api/v1/merchants/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error?.message || "Failed to create key");
        return;
      }
      setNewKey(data.data.key);
      fetchKeys();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsCreating(false);
    }
  }

  async function revokeKey(id: string) {
    try {
      const res = await fetch(`/api/v1/merchants/api-keys?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error("Failed to revoke key");
        return;
      }
      toast.success("API key revoked");
      fetchKeys();
    } catch {
      toast.error("Something went wrong");
    }
  }

  function copyKey() {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("API key copied to clipboard");
    }
  }

  function handleDialogClose(open: boolean) {
    if (!open) {
      setNewKeyName("");
      setNewKey(null);
      setCopied(false);
    }
    setCreateOpen(open);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Keys
            </CardTitle>
            <CardDescription>
              Manage API keys for programmatic access to your merchant account
            </CardDescription>
          </div>
          <Dialog open={createOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Create Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create API Key</DialogTitle>
                <DialogDescription>
                  {newKey
                    ? "Copy your API key now. You won't be able to see it again."
                    : "Give your API key a descriptive name."}
                </DialogDescription>
              </DialogHeader>

              {newKey ? (
                <div className="space-y-4 py-4">
                  <div className="flex items-center gap-2">
                    <Input value={newKey} readOnly className="font-mono text-sm" />
                    <Button variant="outline" size="sm" onClick={copyKey}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-sm text-destructive">
                    Make sure to copy your API key now. You won&apos;t be able to see it again!
                  </p>
                </div>
              ) : (
                <div className="py-4">
                  <Label>Key Name</Label>
                  <Input
                    placeholder="e.g., Production Server"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
              )}

              <DialogFooter>
                {newKey ? (
                  <Button onClick={() => handleDialogClose(false)}>Done</Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => handleDialogClose(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createKey} disabled={isCreating}>
                      {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create
                    </Button>
                  </>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : keys.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No API keys yet. Create one to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium">{key.name}</TableCell>
                  <TableCell className="font-mono text-sm">
                    ****{key.lastFour}
                  </TableCell>
                  <TableCell>
                    <Badge variant={key.isActive ? "default" : "destructive"}>
                      {key.isActive ? "Active" : "Revoked"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {key.lastUsedAt
                      ? format(new Date(key.lastUsedAt), "MMM d, yyyy")
                      : "Never"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(key.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    {key.isActive && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => revokeKey(key.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
