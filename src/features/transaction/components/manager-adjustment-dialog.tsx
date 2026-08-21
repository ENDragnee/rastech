"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { useCreateTransaction } from "@/features/transaction/hooks/use-transactions";
import {
  AlertTriangle,
  Boxes,
  Loader2,
  Search,
  X,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ManagerAdjustmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManagerAdjustmentDialog({
  isOpen,
  onClose,
}: ManagerAdjustmentDialogProps) {
  const [search, setSearch] = useState("");
  const [selectedStock, setSelectedStock] = useState<any | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<
    "ADJUSTMENT_LOSS" | "DEFECTIVE" | "PURCHASED" | "RETURNED"
  >("ADJUSTMENT_LOSS");
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState("");

  const createTransaction = useCreateTransaction();

  // Search stock items for adjustment
  const { data: stockData, isLoading: isSearchingStock } = useQuery({
    queryKey: ["manager-stock-search", search],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "5" });
      if (search) params.append("search", search);
      const res = await axiosInstance.get(`/api/v1/stock?${params.toString()}`);
      return res.data;
    },
    enabled: isOpen && search.length >= 2,
  });

  const searchResults = stockData?.data || [];

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedStock) {
      toast.error("Please search and select a stock item to adjust");
      return;
    }

    if (
      (adjustmentType === "ADJUSTMENT_LOSS" || adjustmentType === "DEFECTIVE") &&
      quantity > selectedStock.quantity
    ) {
      toast.error(
        `Adjustment quantity (${quantity}) exceeds current available stock (${selectedStock.quantity})`
      );
      return;
    }

    try {
      await createTransaction.mutateAsync({
        type: adjustmentType,
        stockId: selectedStock.id,
        quantity,
        price: selectedStock.costPrice * quantity,
        reason,
      });

      toast.success(`Inventory adjustment (${adjustmentType}) recorded successfully`);
      onClose();
      setSelectedStock(null);
      setReason("");
      setSearch("");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to record adjustment");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/40">
          <div className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Managerial Stock &amp; Loss Adjustment
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* 1. Stock Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Select Target Stock / Hardware
            </label>
            {!selectedStock ? (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by product name, SKU, or Serial Number..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-9 text-xs bg-background"
                    autoFocus
                  />
                </div>

                {isSearchingStock && (
                  <div className="p-3 text-center text-xs text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin mx-auto text-primary" />
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div className="max-h-40 overflow-y-auto divide-y divide-border border border-border rounded-xl bg-background">
                    {searchResults.map((st: any) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setSelectedStock(st)}
                        className="w-full p-2.5 text-left text-xs hover:bg-muted/50 transition-colors flex justify-between items-center"
                      >
                        <div>
                          <p className="font-semibold text-foreground">
                            {st.products?.name || "Product"}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className="font-mono">{st.products?.sku}</span>
                            {st.serialNumber && (
                              <span className="text-primary font-mono bg-primary/10 px-1 rounded">
                                SN: {st.serialNumber}
                              </span>
                            )}
                            {st.batchNumber && <span>Batch: {st.batchNumber}</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-foreground">
                            {st.quantity} in stock
                          </span>
                          <span className="text-[10px] block text-muted-foreground">
                            Cost: ${st.costPrice}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-xl border border-border bg-muted/20 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-foreground">
                    {selectedStock.products?.name}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                    <span className="font-mono">{selectedStock.products?.sku}</span>
                    {selectedStock.serialNumber && (
                      <span className="font-mono text-primary bg-primary/10 px-1 rounded">
                        SN: {selectedStock.serialNumber}
                      </span>
                    )}
                    <span>Current Stock: <strong>{selectedStock.quantity}</strong></span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedStock(null)}
                  className="h-7 text-xs text-muted-foreground hover:text-destructive"
                >
                  Change
                </Button>
              </div>
            )}
          </div>

          {/* 2. Adjustment Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Adjustment Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAdjustmentType("ADJUSTMENT_LOSS")}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all ${adjustmentType === "ADJUSTMENT_LOSS"
                    ? "border-destructive bg-destructive/10 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
              >
                <div className="font-semibold text-destructive flex items-center gap-1.5">
                  <TrendingDown className="w-3.5 h-3.5" /> Inventory Loss / Shrinkage
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Discrepancy, missing, or stolen hardware.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAdjustmentType("DEFECTIVE")}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all ${adjustmentType === "DEFECTIVE"
                    ? "border-amber-500 bg-amber-500/10 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
              >
                <div className="font-semibold text-amber-500 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Warehouse Defective
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Damaged in transit or broken in storage.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAdjustmentType("PURCHASED")}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all ${adjustmentType === "PURCHASED"
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
              >
                <div className="font-semibold text-primary flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" /> Manual Restock Intake
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Direct stock replenishment addition.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAdjustmentType("RETURNED")}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all ${adjustmentType === "RETURNED"
                    ? "border-emerald-500 bg-emerald-500/10 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
              >
                <div className="font-semibold text-emerald-500 flex items-center gap-1.5">
                  <Boxes className="w-3.5 h-3.5" /> Restock Return
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Customer return override into inventory.
                </div>
              </button>
            </div>
          </div>

          {/* 3. Quantity */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Quantity to Adjust
            </label>
            <Input
              type="number"
              min={1}
              max={
                selectedStock &&
                  (adjustmentType === "ADJUSTMENT_LOSS" || adjustmentType === "DEFECTIVE")
                  ? selectedStock.quantity
                  : 9999
              }
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="h-9 text-xs bg-background"
              required
            />
          </div>

          {/* 4. Reason */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Manager Audit Reason / Notes
            </label>
            <Input
              type="text"
              placeholder="e.g. Audit reconciliation discrepancy, water leak damage..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="h-9 text-xs bg-background"
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={createTransaction.isPending}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createTransaction.isPending || !selectedStock}
              className="text-xs bg-primary text-primary-foreground font-semibold"
            >
              {createTransaction.isPending ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Recording...
                </span>
              ) : (
                "Commit Adjustment"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
