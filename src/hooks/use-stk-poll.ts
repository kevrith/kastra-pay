"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { STK_POLL_INTERVAL_MS, STK_TIMEOUT_SECONDS } from "@/lib/constants";

interface StkPollState {
  status: "idle" | "waiting" | "completed" | "failed" | "timeout";
  countdown: number;
  mpesaReceipt: string | null;
  error: string | null;
}

export function useStkPoll(checkoutRequestId: string | null, transactionId: string | null) {
  const [state, setState] = useState<StkPollState>({
    status: "idle",
    countdown: STK_TIMEOUT_SECONDS,
    mpesaReceipt: null,
    error: null,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const cleanup = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  const poll = useCallback(async () => {
    if (!checkoutRequestId && !transactionId) return;

    try {
      const params = new URLSearchParams();
      if (checkoutRequestId) params.set("checkoutRequestId", checkoutRequestId);
      if (transactionId) params.set("transactionId", transactionId);

      const res = await fetch(`/api/v1/payments/verify?${params}`);
      const data = await res.json();

      if (data.data?.status === "COMPLETED") {
        cleanup();
        setState({
          status: "completed",
          countdown: 0,
          mpesaReceipt: data.data.mpesaReceiptNumber || null,
          error: null,
        });
      } else if (data.data?.status === "FAILED") {
        cleanup();
        setState({
          status: "failed",
          countdown: 0,
          mpesaReceipt: null,
          error: data.data.failureReason || "Payment failed",
        });
      }
    } catch {
      // Silently continue polling on network errors
    }
  }, [checkoutRequestId, transactionId, cleanup]);

  const startPolling = useCallback(() => {
    setState({
      status: "waiting",
      countdown: STK_TIMEOUT_SECONDS,
      mpesaReceipt: null,
      error: null,
    });

    // Start countdown
    countdownRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.countdown <= 1) {
          cleanup();
          return { ...prev, status: "timeout", countdown: 0 };
        }
        return { ...prev, countdown: prev.countdown - 1 };
      });
    }, 1000);

    // Start polling
    intervalRef.current = setInterval(poll, STK_POLL_INTERVAL_MS);

    // Initial poll
    poll();
  }, [poll, cleanup]);

  const retry = useCallback(() => {
    cleanup();
    startPolling();
  }, [cleanup, startPolling]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return { ...state, startPolling, retry };
}
