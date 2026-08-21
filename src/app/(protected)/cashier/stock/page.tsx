"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import {
  Search,
  Barcode,
  Boxes,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CashierStockPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Fetch stocks with query
  const { data, isLoading } = useQuery<{
    data: {
      id: string;
      serialNumber?: string | null;
      batchNumber?: string | null;
      quantity: number;
      sellingPrice: number;
      withVat: boolean;
      createdAt: string;
      products?: {
        name: string;
        sku: string;
        warrantyDays?: number;
      } | null;
    }[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>({
    queryKey: ["cashier-stocks", search, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      if (search) params.append("search", search);
      const response = await axiosInstance.get(`/api/v1/stock?${params.toString()}`);
      return response.data;
    },
  });

  const stocks = data?.data || [];
  const meta = data?.meta || { totalPages: 1, total: 0, page: 1 };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            Stock &amp; Serial Verification
          </h1>
          <p className="text-xs text-muted-foreground">
            Search physical serial numbers, batch lot codes, and verify current availability.
          </p>
        </div>

        {/* Search */}
        <div className="w-full sm:w-80 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Scan serial #, batch, or SKU..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 h-9 text-xs bg-card"
          />
        </div>
      </div>

      {/* Stock Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <table className="w-full text-xs text-left">
          <thead className="border-b border-border bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
            <tr>
              <th className="p-3.5">Identifier</th>
              <th className="p-3.5">Product / Model</th>
              <th className="p-3.5">SKU</th>
              <th className="p-3.5">Warranty Term</th>
              <th className="p-3.5">Units Available</th>
              <th className="p-3.5">Tax Details</th>
              <th className="p-3.5 text-right">Selling Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                  Looking up inventory records...
                </td>
              </tr>
            ) : stocks.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-muted-foreground">
                  <Boxes className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  No stock or serial numbers match your search.
                </td>
              </tr>
            ) : (
              stocks.map((stock) => (
                <tr key={stock.id} className="hover:bg-muted/30 transition-colors">
                  {/* Serial / Batch */}
                  <td className="p-3.5">
                    {stock.serialNumber ? (
                      <div className="flex items-center gap-1.5">
                        <Barcode className="w-4 h-4 text-primary" />
                        <span className="font-mono font-semibold text-foreground text-xs">
                          {stock.serialNumber}
                        </span>
                      </div>
                    ) : stock.batchNumber ? (
                      <div className="flex items-center gap-1.5">
                        <Boxes className="w-4 h-4 text-muted-foreground" />
                        <span className="font-mono text-muted-foreground text-xs">
                          Batch: {stock.batchNumber}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground font-mono text-[10px]">Unassigned</span>
                    )}
                  </td>

                  {/* Product */}
                  <td className="p-3.5 font-medium text-foreground max-w-xs">
                    {stock.products?.name || "Unlinked Product"}
                  </td>

                  {/* SKU */}
                  <td className="p-3.5 font-mono text-muted-foreground">
                    {stock.products?.sku || "—"}
                  </td>

                  {/* Warranty */}
                  <td className="p-3.5 whitespace-nowrap">
                    {stock.products?.warrantyDays && stock.products.warrantyDays > 0 ? (
                      <span className="flex items-center gap-1 text-primary">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {stock.products.warrantyDays} Days
                      </span>
                    ) : (
                      <span className="text-muted-foreground">No Warranty</span>
                    )}
                  </td>

                  {/* Availability */}
                  <td className="p-3.5 whitespace-nowrap">
                    {stock.quantity > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {stock.quantity} In Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-destructive">
                        <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                        Sold Out
                      </span>
                    )}
                  </td>

                  {/* VAT */}
                  <td className="p-3.5">
                    {stock.withVat ? (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" /> VAT Incl.
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-muted-foreground/60" /> No VAT
                      </span>
                    )}
                  </td>

                  {/* Price */}
                  <td className="p-3.5 font-bold text-foreground text-right whitespace-nowrap text-sm"> ETB {stock.sellingPrice.toFixed(2)}
                  </td>
                </tr>
              ))
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
