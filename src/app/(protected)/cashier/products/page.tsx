"use client";

import { useState } from "react";
import { useProducts } from "@/features/product/hooks/use-products";
import { useCategories } from "@/features/category/hooks/use-categories";
import {
  Search,
  Package,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CashierProductsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [page, setPage] = useState(1);

  const { data: categories = [] } = useCategories();
  const { data: productsData, isLoading } = useProducts(search, selectedCategory);

  const products = productsData?.data || [];
  const meta = productsData?.meta || { totalPages: 1, total: 0, page: 1 };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            Product Price &amp; Catalog
          </h1>
          <p className="text-xs text-muted-foreground">
            Quick reference for hardware pricing, SKU barcodes, and warranty terms.
          </p>
        </div>

        {/* Search */}
        <div className="w-full sm:w-80 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by product name or SKU..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 h-9 text-xs bg-card"
          />
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedCategory("ALL")}
          className={`px-3 py-1.5 text-xs rounded-lg font-medium whitespace-nowrap transition-colors ${selectedCategory === "ALL"
            ? "bg-foreground text-background"
            : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium whitespace-nowrap transition-colors ${selectedCategory === cat.id
              ? "bg-primary text-primary-foreground font-semibold"
              : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <table className="w-full text-xs text-left">
          <thead className="border-b border-border bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
            <tr>
              <th className="p-3.5">SKU / Code</th>
              <th className="p-3.5">Product Name</th>
              <th className="p-3.5">Description</th>
              <th className="p-3.5">Warranty</th>
              <th className="p-3.5">Stock Status</th>
              <th className="p-3.5">VAT</th>
              <th className="p-3.5 text-right">Retail Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                  Loading product catalog...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-muted-foreground">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const totalStock =
                  product.stocks?.reduce((acc, s) => acc + s.quantity, 0) ?? 0;
                const sampleStock = product.stocks?.[0];
                const price = sampleStock?.sellingPrice ?? 0;
                const withVat = sampleStock?.withVat ?? false;

                return (
                  <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3.5 font-mono font-semibold text-foreground">
                      {product.sku}
                    </td>
                    <td className="p-3.5 font-medium text-foreground max-w-xs">
                      {product.name}
                    </td>
                    <td className="p-3.5 text-muted-foreground max-w-sm truncate">
                      {product.description || "—"}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      {product.warrantyDays && product.warrantyDays > 0 ? (
                        <span className="flex items-center gap-1 text-primary">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {product.warrantyDays} Days
                        </span>
                      ) : (
                        <span className="text-muted-foreground">No Warranty</span>
                      )}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      {totalStock > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {totalStock} in stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-destructive">
                          <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                          Out of stock
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {withVat ? (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> 15% VAT
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-muted-foreground/60" /> None
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 font-bold text-foreground text-right whitespace-nowrap text-sm"> ETB {price.toFixed(2)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="p-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground bg-muted/20">
          <span>
            Showing Page {meta.page || 1} of {meta.totalPages || 1}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-7 px-2 text-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="h-7 px-2 text-xs"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
