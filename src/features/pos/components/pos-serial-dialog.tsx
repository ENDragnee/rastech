"use client";

import { useState } from "react";
import { ProductItem, ProductStock } from "@/features/product/hooks/use-products";
import { Input } from "@/components/ui/input";
import { Barcode, Boxes, Search, X, CheckCircle2 } from "lucide-react";

interface PosSerialDialogProps {
  product: ProductItem;
  isOpen: boolean;
  onClose: () => void;
  onSelectStock: (stock: ProductStock) => void;
}

export function PosSerialDialog({
  product,
  isOpen,
  onClose,
  onSelectStock,
}: PosSerialDialogProps) {
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const availableStocks = product.stocks?.filter((s) => s.quantity > 0) || [];

  const filtered = availableStocks.filter((s) => {
    const term = search.toLowerCase();
    return (
      (s.serialNumber && s.serialNumber.toLowerCase().includes(term)) ||
      (s.batchNumber && s.batchNumber.toLowerCase().includes(term)) ||
      product.name.toLowerCase().includes(term)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/40">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Select Stock Batch or Serial Number
            </h2>
            <p className="text-xs text-muted-foreground truncate max-w-xs">
              {product.name} ({product.sku})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {/* Live Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Filter by Serial #, Batch code, or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs bg-background"
              autoFocus
            />
          </div>

          {/* List of Available Batches & Serial Units */}
          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {filtered.map((stock) => (
              <button
                key={stock.id}
                type="button"
                onClick={() => {
                  onSelectStock(stock);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-border bg-background hover:border-primary hover:bg-primary/5 transition-all text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-muted text-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    {stock.serialNumber ? (
                      <Barcode className="w-4 h-4" />
                    ) : (
                      <Boxes className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-foreground block">
                      {stock.serialNumber
                        ? `SN: ${stock.serialNumber}`
                        : `Batch: ${stock.batchNumber || "Standard Batch"}`}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {stock.serialNumber
                        ? "1 Unit (Serialized Device)"
                        : `${stock.quantity} Units Available in Batch`}
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-xs font-bold text-primary block"> ETB {stock.sellingPrice.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Cost: ETB {stock.costPrice.toFixed(2)}
                  </span>
                </div>
              </button>
            ))}

            {filtered.length === 0 && (
              <p className="text-center py-6 text-xs text-muted-foreground">
                No matching available inventory found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
