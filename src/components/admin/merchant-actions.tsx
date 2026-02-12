"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, CheckCircle, Ban, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface MerchantActionsProps {
  merchantId: string;
  currentStatus: string;
}

export function MerchantActions({ merchantId, currentStatus }: MerchantActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function updateStatus(status: string) {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/merchants/${merchantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error?.message || "Failed to update merchant");
        return;
      }

      toast.success(`Merchant ${status.toLowerCase()} successfully`);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <Loader2 className="h-4 w-4 animate-spin" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {currentStatus !== "ACTIVE" && (
          <DropdownMenuItem onClick={() => updateStatus("ACTIVE")}>
            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
            Approve
          </DropdownMenuItem>
        )}
        {currentStatus !== "SUSPENDED" && (
          <DropdownMenuItem onClick={() => updateStatus("SUSPENDED")}>
            <Ban className="mr-2 h-4 w-4 text-yellow-500" />
            Suspend
          </DropdownMenuItem>
        )}
        {currentStatus !== "DEACTIVATED" && (
          <DropdownMenuItem onClick={() => updateStatus("DEACTIVATED")}>
            <XCircle className="mr-2 h-4 w-4 text-red-500" />
            Deactivate
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
