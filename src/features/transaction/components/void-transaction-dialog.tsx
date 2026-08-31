"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Ban, Loader2, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";
import { type TransactionItem } from "@/features/transaction/hooks/use-transactions";

interface VoidTransactionDialogProps {
  transaction: TransactionItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function VoidTransactionDialog({
  transaction,
  isOpen,
  onClose,
}: VoidTransactionDialogProps) {
  const [reason, setReason] = useState("");
  const queryClient = useQueryClient();

  const voidMutation = useMutation({
    mutationFn: async (payload: { transactionId: string; reason: string }) => {
      const res = await axiosInstance.post("/api/v1/transaction/void", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-analytics"] });
    },
  });

  if (!isOpen || !transaction) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await voidMutation.mutateAsync({
        transactionId: transaction.id,
        reason,
      });
      toast.success(`Invoice ${transaction.invoiceNumber} has been voided and stock restored.`);
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to void transaction");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/40">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-destructive/10 text-destructive">
              <Ban className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">
              Void &amp; Cancel Transaction
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 rounded-xl border border-border bg-background space-y-1 text-xs">
            <div className="flex justify-between font-bold text-foreground">
              <span>{transaction.invoiceNumber}</span>
              <span className="font-mono">ETB {transaction.price.toFixed(2)}</span>
            </div>
            <p className="text-muted-foreground">{transaction.stocks?.products?.name}</p>
            {transaction.stocks?.serialNumber && (
              <p className="font-mono text-[10px] text-primary">SN: {transaction.stocks.serialNumber}</p>
            )}
          </div>

          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              Permanent Audit Notice
            </p>
            <p className="text-[11px] opacity-90 leading-relaxed">
              This will mark the invoice as <strong>VOIDED</strong> and automatically restore <strong>{transaction.quantity} unit(s)</strong> back into active inventory.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">
              Reason for Cancellation (Required)
            </label>
            <Input
              type="text"
              placeholder="e.g. Duplicate cashier entry, customer card failed..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="h-8 text-xs bg-background"
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={voidMutation.isPending}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={voidMutation.isPending || reason.trim().length < 5}
              className="text-xs font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {voidMutation.isPending ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Voiding...
                </span>
              ) : (
                "Confirm Void"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
