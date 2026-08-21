"use client";

import { type TransactionItem } from "@/features/transaction/hooks/use-transactions";
import {
  X,
  Receipt,
  User,
  Barcode,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface TransactionDetailsDialogProps {
  transaction: TransactionItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionDetailsDialog({
  transaction,
  isOpen,
  onClose,
}: TransactionDetailsDialogProps) {
  if (!isOpen || !transaction) return null;

  const isWarrantyValid =
    transaction.warrantyEndsAt && new Date(transaction.warrantyEndsAt) > new Date();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/40">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Transaction Details &amp; Audit
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Status & Invoice Bar */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-background">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                Invoice Reference
              </span>
              <span className="font-mono font-bold text-foreground text-sm">
                {transaction.invoiceNumber}
              </span>
            </div>
            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${transaction.type === "SOLD"
                  ? "bg-emerald-500/10 text-emerald-500"
                  : transaction.type === "RETURNED"
                    ? "bg-amber-500/10 text-amber-500"
                    : transaction.type === "DEFECTIVE"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-purple-500/10 text-purple-500"
                }`}
            >
              {transaction.type}
            </span>
          </div>

          {/* Product & Stock Meta */}
          <div className="space-y-2 border-b border-border pb-3">
            <h3 className="text-muted-foreground font-semibold text-[11px]">Hardware &amp; Inventory</h3>
            <p className="text-foreground font-medium text-sm">
              {transaction.stocks?.products?.name || "Unlinked Product"}
            </p>
            <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-mono">
              <span className="bg-muted px-2 py-0.5 rounded text-muted-foreground">
                SKU: {transaction.stocks?.products?.sku || "—"}
              </span>
              {transaction.stocks?.serialNumber && (
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded flex items-center gap-1">
                  <Barcode className="w-3 h-3" />
                  SN: {transaction.stocks.serialNumber}
                </span>
              )}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="space-y-2 border-b border-border pb-3">
            <h3 className="text-muted-foreground font-semibold text-[11px]">Financial Record</h3>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-muted-foreground block">Quantity</span>
                <span className="font-bold text-foreground">{transaction.quantity} Unit(s)</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Total Amount</span>
                <span className="font-bold text-foreground text-sm"> ETB {transaction.price.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Payment Method</span>
                <span className="font-medium text-foreground capitalize">
                  {transaction.paymentMethod?.toLowerCase() || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Processed Date</span>
                <span className="text-foreground">
                  {new Date(transaction.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Customer & Warranty Info */}
          <div className="space-y-2 border-b border-border pb-3">
            <h3 className="text-muted-foreground font-semibold text-[11px]">Customer &amp; Warranty</h3>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-muted-foreground block">Customer Name</span>
                <span className="font-medium text-foreground">{transaction.customerName || "Walk-in"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Customer Phone</span>
                <span className="font-medium text-foreground">{transaction.customerPhone || "N/A"}</span>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between">
              <span className="text-muted-foreground">Warranty Coverage:</span>
              {transaction.warrantyEndsAt ? (
                isWarrantyValid ? (
                  <span className="text-emerald-500 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Active (until{" "}
                    {new Date(transaction.warrantyEndsAt).toLocaleDateString()})
                  </span>
                ) : (
                  <span className="text-destructive font-semibold flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Expired
                  </span>
                )
              ) : (
                <span className="text-muted-foreground">No Warranty</span>
              )}
            </div>
          </div>

          {/* Audit Actor */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary" /> Processed by Staff:
            </span>
            <span className="font-mono text-foreground font-semibold">
              @{transaction.users?.userName || "system"}
            </span>
          </div>
        </div>

        <div className="p-3 border-t border-border bg-muted/20 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
