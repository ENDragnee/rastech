"use client";

import { useState } from "react";
import { type TransactionItem, useProcessReturn } from "@/features/transaction/hooks/use-transactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RotateCcw, AlertTriangle, ShieldCheck, ShieldAlert, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface ReturnDialogProps {
  transaction: TransactionItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReturnDialog({ transaction, isOpen, onClose }: ReturnDialogProps) {
  const [returnType, setReturnType] = useState<"RETURNED" | "DEFECTIVE">("RETURNED");
  const [reason, setReason] = useState("");
  const processReturn = useProcessReturn();

  if (!isOpen || !transaction) return null;

  const isWarrantyExpired = transaction.warrantyEndsAt
    ? new Date() > new Date(transaction.warrantyEndsAt)
    : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await processReturn.mutateAsync({
        originalTransactionId: transaction.id,
        type: returnType,
        quantity: transaction.quantity,
        reason,
      });

      toast.success(
        returnType === "RETURNED"
          ? "Item returned and restocked into inventory"
          : "Item marked defective and logged"
      );
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to process return");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/40">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-foreground">Process Return / Warranty</h2>
          </div>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Hardware & Warranty Summary */}
          <div className="p-3 rounded-lg border border-border bg-background space-y-2 text-xs">
            <div className="flex justify-between items-start">
              <span className="font-semibold text-foreground">
                {transaction.stocks?.products?.name || "Hardware Item"}
              </span>
              <span className="font-mono text-muted-foreground">{transaction.invoiceNumber}</span>
            </div>

            {transaction.stocks?.serialNumber && (
              <div className="font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded inline-block text-[11px]">
                SN: {transaction.stocks.serialNumber}
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <span className="text-muted-foreground">Warranty Status:</span>
              {isWarrantyExpired ? (
                <span className="text-destructive font-semibold flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Expired (
                  {new Date(transaction.warrantyEndsAt!).toLocaleDateString()})
                </span>
              ) : (
                <span className="text-emerald-500 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Active until{" "}
                  {transaction.warrantyEndsAt
                    ? new Date(transaction.warrantyEndsAt).toLocaleDateString()
                    : "Lifetime"}
                </span>
              )}
            </div>
          </div>

          {/* Condition Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Return Classification</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setReturnType("RETURNED")}
                className={`p-3 rounded-xl border text-left transition-all text-xs ${returnType === "RETURNED"
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
              >
                <div className="font-semibold text-emerald-500">Refund &amp; Restock</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Item is working. Add unit back to active stock.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setReturnType("DEFECTIVE")}
                className={`p-3 rounded-xl border text-left transition-all text-xs ${returnType === "DEFECTIVE"
                    ? "border-destructive bg-destructive/10 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
              >
                <div className="font-semibold text-destructive">Mark Defective</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Damaged/broken. Do NOT restock into inventory.
                </div>
              </button>
            </div>
          </div>

          {/* Reason Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Reason / Fault Details</label>
            <Input
              type="text"
              placeholder="e.g. Defective HDMI port, customer changed mind..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="h-9 text-xs bg-background"
              required
            />
          </div>

          {isWarrantyExpired && (
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[11px] flex gap-2 items-center">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Warning: This unit is past its warranty expiration date.</span>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={processReturn.isPending}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={processReturn.isPending}
              className="text-xs bg-primary text-primary-foreground font-semibold"
            >
              {processReturn.isPending ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Processing...
                </span>
              ) : (
                "Confirm Return"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
