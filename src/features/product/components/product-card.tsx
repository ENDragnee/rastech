"use client";

import { ProductItem } from "@/features/product/hooks/use-products";
import { Layers, ShieldCheck, CheckCircle2 } from "lucide-react";

interface ProductCardProps {
  product: ProductItem;
  onSelect: (product: ProductItem) => void;
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  // Aggregate live stock count and representative price
  const availableStock = product.stocks?.reduce((acc, s) => acc + s.quantity, 0) ?? 0;
  const sampleStock = product.stocks?.[0];
  const unitPrice = sampleStock?.sellingPrice ?? 0;
  const withVat = sampleStock?.withVat ?? false;
  const isOutOfStock = availableStock <= 0;

  return (
    <button
      type="button"
      disabled={isOutOfStock}
      onClick={() => onSelect(product)}
      className={`flex flex-col text-left p-4 rounded-xl border transition-all text-card-foreground bg-card group relative overflow-hidden ${isOutOfStock
        ? "opacity-50 border-border cursor-not-allowed"
        : "border-border/80 hover:border-primary hover:shadow-md active:scale-[0.99]"
        }`}
    >
      <div className="flex justify-between items-start w-full mb-2">
        <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded font-medium">
          {product.sku}
        </span>
        {withVat ? (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" /> VAT Incl.
          </span>
        ) : (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            No VAT
          </span>
        )}
      </div>

      <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
        {product.name}
      </h3>

      {product.description && (
        <p className="text-xs text-muted-foreground line-clamp-1 mb-3">
          {product.description}
        </p>
      )}

      <div className="mt-auto pt-3 w-full border-t border-border/50 flex justify-between items-end">
        <div className="flex flex-col">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Layers className="w-3 h-3" />
            {isOutOfStock ? "Out of Stock" : `${availableStock} in stock`}
          </span>
          {product.warrantyDays ? (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-primary" />
              {product.warrantyDays}d Warranty
            </span>
          ) : null}
        </div>
        <span className="font-bold text-base text-foreground">
          ${unitPrice.toFixed(2)}
        </span>
      </div>
    </button>
  );
}
