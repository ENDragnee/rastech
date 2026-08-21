"use client";

import React, { useState } from "react";
import { ProductItem, ProductStock } from "@/features/product/hooks/use-products";
import { Input } from "@/components/ui/input";
import { Barcode, Search, X } from "lucide-react";

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

  const serializedStocks =
    product.stocks?.filter((s) => s.serialNumber && s.quantity > 0) || [];

  const filtered = serializedStocks.filter((s) =>
    s.serialNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-card rounded-xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/40">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Select Serial Number
            </h2>
            <p className="text-xs text-muted-foreground truncate max-w-xs">
              {product.name}
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Scan or search serial number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
              autoFocus
            />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {filtered.map((stock) => (
              <button
                key={stock.id}
                onClick={() => {
                  onSelectStock(stock);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-border bg-background hover:border-primary hover:bg-primary/5 transition-all text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <Barcode className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                  <span className="text-xs font-mono font-medium text-foreground">
                    {stock.serialNumber}
                  </span>
                </div>
                <span className="text-xs font-semibold text-primary">
                  ${stock.sellingPrice.toFixed(2)}
                </span>
              </button>
            ))}

            {filtered.length === 0 && (
              <p className="text-center py-6 text-xs text-muted-foreground">
                No available serial numbers found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
