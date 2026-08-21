"use client";

import { useState } from "react";
import { useStocks, type StockItem } from "@/features/stock/hooks/use-stocks";
import {
  Search,
  Boxes,
  Barcode,
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StockFormDialog } from "@/features/stock/components/stock-form-dialog";
import { DeleteStockDialog } from "@/features/stock/components/delete-stock-dialog";

export default function ManagerStockPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "SERIALIZED" | "BATCH" | "LOW_STOCK">("ALL");
  const [page, setPage] = useState(1);

  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<StockItem | null>(null);
  const [deletingStock, setDeletingStock] = useState<StockItem | null>(null);

  const { data, isLoading } = useStocks(search, page);

  const stocks = data?.data || [];
  const meta = data?.meta || { totalPages: 1, total: 0, page: 1 };

  // Filter in memory for tab selection
  const filteredStocks = stocks.filter((stock) => {
    if (typeFilter === "SERIALIZED") return !!stock.serialNumber;
    if (typeFilter === "BATCH") return !stock.serialNumber;
    if (typeFilter === "LOW_STOCK") return stock.quantity < 5;
    return true;
  });

  // KPI Calculations
  const totalUnits = stocks.reduce((sum, s) => sum + s.quantity, 0);
  const totalCostValue = stocks.reduce((sum, s) => sum + s.quantity * s.costPrice, 0);
  const potentialRetailValue = stocks.reduce((sum, s) => sum + s.quantity * s.sellingPrice, 0);

  const handleOpenCreate = () => {
    setEditingStock(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (stock: StockItem) => {
    setEditingStock(stock);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            Inventory Batches &amp; Serial Registry
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Record physical stock intakes, track unique hardware serial numbers, and monitor cost valuations.
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleOpenCreate}
          className="text-xs gap-1.5 bg-primary text-primary-foreground font-semibold shadow-sm w-full sm:w-auto h-9"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Record Stock Intake
        </Button>
      </div>

      {/* Real-time Inventory Asset Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 sm:p-4 rounded-2xl border border-border bg-card shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Warehouse Asset Value (Cost)</span>
            <DollarSign className="w-4 h-4 text-primary" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-foreground font-mono">
            ${totalCostValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-muted-foreground block">Wholesale capital basis</span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl border border-border bg-card shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Realizable Retail Potential</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-500 font-mono">
            ${potentialRetailValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-muted-foreground block">Expected sales revenue</span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl border border-border bg-card shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Total Physical Units</span>
            <Boxes className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-foreground font-mono">
            {totalUnits} Units
          </div>
          <span className="text-[10px] text-muted-foreground block">Across {meta.total} stock records</span>
        </div>
      </div>

      {/* Search & Filter Strip */}
      <div className="space-y-3 bg-card p-3 sm:p-4 rounded-2xl border border-border shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
          {/* Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full text-xs scrollbar-none">
            <button
              type="button"
              onClick={() => {
                setTypeFilter("ALL");
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${typeFilter === "ALL"
                  ? "bg-foreground text-background font-semibold"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground"
                }`}
            >
              All Inventory ({meta.total})
            </button>
            <button
              type="button"
              onClick={() => {
                setTypeFilter("SERIALIZED");
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${typeFilter === "SERIALIZED"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground"
                }`}
            >
              Serialized Hardware
            </button>
            <button
              type="button"
              onClick={() => {
                setTypeFilter("BATCH");
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${typeFilter === "BATCH"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground"
                }`}
            >
              Bulk Batches
            </button>
            <button
              type="button"
              onClick={() => {
                setTypeFilter("LOW_STOCK");
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${typeFilter === "LOW_STOCK"
                  ? "bg-amber-500/15 text-amber-500 font-semibold border border-amber-500/30"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground"
                }`}
            >
              Low Stock (&lt;5)
            </button>
          </div>

          {/* Search Bar */}
          <div className="w-full lg:w-80 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search serial #, batch, SKU..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-9 text-xs bg-background"
            />
          </div>
        </div>
      </div>

      {/* Main Responsive Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[850px]">
            <thead className="border-b border-border bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="p-3.5">Identifier</th>
                <th className="p-3.5">Product Model</th>
                <th className="p-3.5">SKU</th>
                <th className="p-3.5">Quantity</th>
                <th className="p-3.5">Cost Price</th>
                <th className="p-3.5">Retail Price</th>
                <th className="p-3.5">Markup %</th>
                <th className="p-3.5">Tax Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                    Loading inventory batches...
                  </td>
                </tr>
              ) : filteredStocks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-muted-foreground">
                    <Boxes className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    No stock or serial numbers found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredStocks.map((st) => {
                  const markup =
                    st.costPrice > 0
                      ? ((st.sellingPrice - st.costPrice) / st.costPrice) * 100
                      : 0;

                  return (
                    <tr key={st.id} className="hover:bg-muted/30 transition-colors">
                      {/* Serial / Batch Identifier */}
                      <td className="p-3.5 whitespace-nowrap">
                        {st.serialNumber ? (
                          <div className="flex items-center gap-1.5">
                            <Barcode className="w-4 h-4 text-primary" />
                            <span className="font-mono font-semibold text-foreground text-xs">
                              {st.serialNumber}
                            </span>
                          </div>
                        ) : st.batchNumber ? (
                          <div className="flex items-center gap-1.5">
                            <Boxes className="w-4 h-4 text-muted-foreground" />
                            <span className="font-mono text-muted-foreground text-xs">
                              Batch: {st.batchNumber}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground font-mono text-[10px]">Unassigned</span>
                        )}
                      </td>

                      {/* Product Name */}
                      <td className="p-3.5 max-w-xs">
                        <div className="font-medium text-foreground line-clamp-1">
                          {st.products?.name || "Unlinked Product"}
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="p-3.5 font-mono text-muted-foreground whitespace-nowrap">
                        {st.products?.sku || "—"}
                      </td>

                      {/* Quantity */}
                      <td className="p-3.5 whitespace-nowrap">
                        {st.quantity > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {st.quantity} Units
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-destructive">
                            <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                            Sold Out
                          </span>
                        )}
                      </td>

                      {/* Cost Price */}
                      <td className="p-3.5 font-mono text-muted-foreground whitespace-nowrap">
                        ${st.costPrice.toFixed(2)}
                      </td>

                      {/* Retail Price */}
                      <td className="p-3.5 font-mono font-bold text-foreground whitespace-nowrap">
                        ${st.sellingPrice.toFixed(2)}
                      </td>

                      {/* Markup % */}
                      <td className="p-3.5 font-mono whitespace-nowrap">
                        <span
                          className={`font-semibold ${markup >= 25
                              ? "text-emerald-500"
                              : markup > 0
                                ? "text-primary"
                                : "text-destructive"
                            }`}
                        >
                          +{markup.toFixed(1)}%
                        </span>
                      </td>

                      {/* Tax Status */}
                      <td className="p-3.5 whitespace-nowrap">
                        {st.withVat ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            VAT (15%)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-500 border border-rose-500/30">
                            <XCircle className="w-3 h-3" />
                            Non-VAT
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right whitespace-nowrap space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(st)}
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                          title="Edit stock"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingStock(st)}
                          className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                          title="Delete stock"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground bg-muted/20">
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
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
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

      {/* CRUD Modals */}
      <StockFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        stock={editingStock}
      />

      <DeleteStockDialog
        isOpen={!!deletingStock}
        onClose={() => setDeletingStock(null)}
        stock={deletingStock}
      />
    </div>
  );
}
