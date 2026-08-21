"use client";

import { useState } from "react";
import {
  useTransactions,
  useProcessReturn,
  type TransactionItem,
} from "@/features/transaction/hooks/use-transactions";
import {
  RotateCcw,
  Search,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  XCircle,
  Barcode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function CashierReturnsPage() {
  const [invoiceQuery, setInvoiceQuery] = useState("");
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);
  const [returnType, setReturnType] = useState<"RETURNED" | "DEFECTIVE">("RETURNED");
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState("");

  const { data: txData, isLoading: isSearching } = useTransactions(invoiceQuery, 1);
  const processReturn = useProcessReturn();

  const foundTransactions = txData?.data?.filter((t) => t.type === "SOLD") || [];

  const handleSelectTransaction = (tx: TransactionItem) => {
    setSelectedTx(tx);
    setQuantity(1);
    setReason("");
  };

  const isWarrantyExpired =
    selectedTx?.warrantyEndsAt && new Date() > new Date(selectedTx.warrantyEndsAt);

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTx) {
      toast.error("Please search and select a transaction invoice to return.");
      return;
    }

    if (quantity > selectedTx.quantity) {
      toast.error(`Cannot return more than purchased (${selectedTx.quantity} units)`);
      return;
    }

    if (isWarrantyExpired) {
      const confirmOverride = window.confirm(
        "Warning: This device's warranty period has expired. Do you still wish to proceed?"
      );
      if (!confirmOverride) return;
    }

    try {
      await processReturn.mutateAsync({
        originalTransactionId: selectedTx.id,
        type: returnType,
        quantity,
        reason: reason.trim(),
      });

      toast.success(
        returnType === "RETURNED"
          ? "Item refunded and restocked into inventory"
          : "Item marked as defective and logged"
      );

      setSelectedTx(null);
      setInvoiceQuery("");
      setReason("");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to process return.");
    }
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto py-2 animate-in fade-in duration-300">
      {/* Top Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Returns &amp; Hardware Warranty Desk
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Look up customer purchase invoices, verify active warranty coverage, and process restocked or defective claims.
        </p>
      </div>

      {/* Step 1: Lookup Box */}
      <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-sm space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-primary" />
          1. Look Up Purchase Invoice or Serial Number
        </h2>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter invoice # (e.g. INV-2026-0001), phone #, or serial number..."
            value={invoiceQuery}
            onChange={(e) => setInvoiceQuery(e.target.value)}
            className="pl-10 h-11 text-xs bg-background rounded-xl"
            autoFocus
          />
        </div>

        {isSearching && (
          <div className="p-3 text-center text-xs text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin mx-auto text-primary" />
          </div>
        )}

        {invoiceQuery.trim().length >= 2 && foundTransactions.length > 0 && (
          <div className="divide-y divide-border border border-border rounded-xl bg-background overflow-hidden max-h-56 overflow-y-auto">
            {foundTransactions.map((tx) => (
              <button
                key={tx.id}
                type="button"
                onClick={() => handleSelectTransaction(tx)}
                className={`w-full p-3 text-left text-xs transition-colors flex justify-between items-center ${selectedTx?.id === tx.id ? "bg-primary/10 border-l-4 border-l-primary" : "hover:bg-muted/50"
                  }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-foreground">{tx.invoiceNumber}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="font-medium text-foreground mt-0.5">{tx.stocks?.products?.name}</p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                    <span>Customer: {tx.customerName || "Walk-in"}</span>
                    {tx.stocks?.serialNumber && <span>SN: {tx.stocks.serialNumber}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-foreground">${tx.price.toFixed(2)}</span>
                  <span className="text-[10px] block text-primary font-medium">Select Invoice</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Step 2: Return Details Form (Displays once invoice is selected) */}
      {selectedTx && (
        <form onSubmit={handleSubmitReturn} className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-5 animate-in slide-in-from-bottom-3 duration-200 text-xs">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-foreground">
                2. Process Return on Invoice #{selectedTx.invoiceNumber}
              </h2>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedTx(null)}
              className="h-7 text-xs text-muted-foreground"
            >
              Clear Selection
            </Button>
          </div>

          {/* Product & Warranty Information Card */}
          <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-sm text-foreground">{selectedTx.stocks?.products?.name}</p>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono mt-0.5">
                  <span>SKU: {selectedTx.stocks?.products?.sku}</span>
                  {selectedTx.stocks?.serialNumber && (
                    <span className="text-primary font-semibold bg-primary/10 px-1 rounded flex items-center gap-1">
                      <Barcode className="w-3 h-3" />
                      SN: {selectedTx.stocks.serialNumber}
                    </span>
                  )}
                </div>
              </div>
              <span className="font-mono font-bold text-sm text-foreground">${selectedTx.price.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <span className="text-muted-foreground">Warranty Coverage:</span>
              {isWarrantyExpired ? (
                <span className="text-destructive font-semibold flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Warranty Expired (
                  {new Date(selectedTx.warrantyEndsAt!).toLocaleDateString()})
                </span>
              ) : selectedTx.warrantyEndsAt ? (
                <span className="text-emerald-500 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Active until{" "}
                  {new Date(selectedTx.warrantyEndsAt).toLocaleDateString()}
                </span>
              ) : (
                <span className="text-muted-foreground">No Registered Warranty</span>
              )}
            </div>
          </div>

          {/* Return Classification Choice */}
          <div className="space-y-1.5">
            <label className="font-medium text-foreground">Return Classification</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setReturnType("RETURNED")}
                className={`p-3 rounded-xl border text-left transition-all ${returnType === "RETURNED"
                  ? "border-emerald-500 bg-emerald-500/10 text-foreground font-semibold shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-emerald-500">
                  <CheckCircle2 className="w-4 h-4" />
                  Refund &amp; Restock Item
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5 font-normal">
                  Unit is functional. Increments inventory stock back into warehouse.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setReturnType("DEFECTIVE")}
                className={`p-3 rounded-xl border text-left transition-all ${returnType === "DEFECTIVE"
                  ? "border-destructive bg-destructive/10 text-foreground font-semibold shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-destructive">
                  <XCircle className="w-4 h-4" />
                  Mark Defective / Dead on Arrival (DOA)
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5 font-normal">
                  Damaged/broken hardware. Does NOT return unit to active saleable stock.
                </p>
              </button>
            </div>
          </div>

          {/* Quantity & Reason */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="font-medium text-foreground">
                Return Quantity <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                min={1}
                max={selectedTx.quantity}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="h-9 text-xs bg-background"
                required
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-medium text-foreground">
                Return Reason / Customer Statement <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. Display backlight failure, customer changed mind..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="h-9 text-xs bg-background"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-border flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectedTx(null)}
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
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing Return...
                </span>
              ) : (
                "Confirm & Process Return"
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
