"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Play, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface SettlementActionsProps {
  failedCount: number;
}

export function SettlementActions({ failedCount }: SettlementActionsProps) {
  const [running, setRunning] = useState(false);

  const triggerSettlementCycle = async () => {
    setRunning(true);
    try {
      const res = await fetch("/api/v1/settlements/run", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${prompt("Enter settlement cron secret:")}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Settlement cycle failed");
        return;
      }

      toast.success(
        `Settlement cycle complete: ${data.processed} processed, ${data.failed} failed, ${data.skipped} skipped`
      );

      // Refresh the page to show updated data
      window.location.reload();
    } catch {
      toast.error("Failed to trigger settlement cycle");
    } finally {
      setRunning(false);
    }
  };

  return (
    <Card>
      <CardContent className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <div>
            <p className="font-medium">Settlement Cycle</p>
            <p className="text-sm text-muted-foreground">
              Runs automatically daily at 2:00 AM UTC. You can also trigger it manually.
            </p>
          </div>
          {failedCount > 0 && (
            <div className="flex items-center gap-1 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                {failedCount} failed settlement{failedCount !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
        <Button onClick={triggerSettlementCycle} disabled={running}>
          {running ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          Run Now
        </Button>
      </CardContent>
    </Card>
  );
}
