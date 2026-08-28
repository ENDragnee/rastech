"use client";

import { useState } from "react";
import { type CreditItem, useUpdateCreditStatus } from "../hooks/use-credits";
import { Button } from "@/components/ui/button";
import { CheckCircle2, RotateCcw, ShieldAlert, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface CreditStatusDialogProps {
  credit: CreditItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CreditStatusDialog({ credit, isOpen, onClose }: CreditStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<"PAID" | "RETURNED" | "DEFAULTED">("PAID");
  const updateCredit = useUpdateCreditStatus();

  if (!isOpen || !credit) return null;

  const handleResolve = async () => {
    try {
      await updateCredit.mutateAsync({
        id: credit.id,
        status: selectedStatus,
      });

      toast.success(`Credit marked as ${selectedStatus}`);
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to update credit status");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/40">
          <h2 className="text-sm font-semibold text-foreground">Settle Credit Record</h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="p-3 rounded-xl border border-border bg-background space-y-1 text-xs">
            <div className="flex justify-between font-semibold text-foreground">
              <span>{credit.customerName}</span>
              <span>${credit.totalAmount.toFixed(2)}</span>
            </div>
            <p className="text-muted-foreground">{credit.stock.products.name}</p>
            {credit.stock.serialNumber && (
              <p className="text-[10px] text-primary font-mono">SN: {credit.stock.serialNumber}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">Resolution Action</label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setSelectedStatus("PAID")}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left text-xs transition-all ${selectedStatus === "PAID"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-500 font-semibold"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <div>
                  <div>Mark as Fully Paid</div>
                  <div className="text-[10px] text-muted-foreground font-normal">Payment received from customer.</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus("RETURNED")}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left text-xs transition-all ${selectedStatus === "RETURNED"
                    ? "border-blue-500 bg-blue-500/10 text-blue-500 font-semibold"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
              >
                <RotateCcw className="w-4 h-4 shrink-0" />
                <div>
                  <div>Item Returned (Restock to Inventory)</div>
                  <div className="text-[10px] text-muted-foreground font-normal">Customer returned hardware. Adds unit back to stock.</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus("DEFAULTED")}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left text-xs transition-all ${selectedStatus === "DEFAULTED"
                    ? "border-destructive bg-destructive/10 text-destructive font-semibold"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
              >
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <div>
                  <div>Mark as Defaulted (Loss Write-Off)</div>
                  <div className="text-[10px] text-muted-foreground font-normal">Customer unable to pay. Write off as bad debt.</div>
                </div>
              </button>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={updateCredit.isPending} className="text-xs">
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={handleResolve} disabled={updateCredit.isPending} className="text-xs bg-primary">
              {updateCredit.isPending ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                </span>
              ) : (
                "Confirm Resolution"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
