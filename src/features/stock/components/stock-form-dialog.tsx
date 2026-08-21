"use client";

import { useState, useEffect } from "react";
import type { SyntheticEvent } from "react";
import {
  useCreateStock,
  useUpdateStock,
  type StockItem,
} from "@/features/stock/hooks/use-stocks";
import { useProducts, type ProductItem } from "@/features/product/hooks/use-products";
import {
  Boxes,
  Barcode,
  X,
  Loader2,
  DollarSign,
  CheckCircle2,
  XCircle,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface StockFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  stock?: StockItem | null;
}

export function StockFormDialog({
  isOpen,
  onClose,
  stock,
}: StockFormDialogProps) {
  const isEditing = !!stock;

  const [stockType, setStockType] = useState<"SERIALIZED" | "BATCH">("SERIALIZED");
  const [productId, setProductId] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  const [serialNumber, setSerialNumber] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [costPrice, setCostPrice] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [withVat, setWithVat] = useState<boolean>(true);

  // Queries & Mutations
  const { data: productsData, isLoading: isLoadingProducts } = useProducts(productSearch);
  const createStock = useCreateStock();
  const updateStock = useUpdateStock();

  const productsList = productsData?.data || [];

  useEffect(() => {
    if (isOpen) {
      if (stock) {
        setProductId(stock.productId || "");
        setSelectedProduct(stock.products as any);
        setSerialNumber(stock.serialNumber || "");
        setBatchNumber(stock.batchNumber || "");
        setQuantity(stock.quantity || 1);
        setCostPrice(stock.costPrice || 0);
        setSellingPrice(stock.sellingPrice || 0);
        setWithVat(stock.withVat ?? true);
        setStockType(stock.serialNumber ? "SERIALIZED" : "BATCH");
      } else {
        setProductId("");
        setSelectedProduct(null);
        setProductSearch("");
        setSerialNumber("");
        setBatchNumber("");
        setQuantity(1);
        setCostPrice(0);
        setSellingPrice(0);
        setWithVat(true);
        setStockType("SERIALIZED");
      }
    }
  }, [stock, isOpen]);

  if (!isOpen) return null;

  const markupPercent =
    costPrice > 0 ? ((sellingPrice - costPrice) / costPrice) * 100 : 0;
  const marginPercent =
    sellingPrice > 0 ? ((sellingPrice - costPrice) / sellingPrice) * 100 : 0;

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isEditing && !productId) {
      toast.error("Please select a product for this stock intake.");
      return;
    }

    if (costPrice < 0 || sellingPrice < 0) {
      toast.error("Prices cannot be negative.");
      return;
    }

    try {
      if (isEditing && stock) {
        await updateStock.mutateAsync({
          id: stock.id,
          costPrice,
          sellingPrice,
          quantity: stockType === "SERIALIZED" ? 1 : quantity,
          withVat,
          serialNumber: serialNumber.trim() ? serialNumber.trim() : null, // Optional
          batchNumber: batchNumber.trim() ? batchNumber.trim() : null, // Optional
        });
        toast.success("Stock details updated successfully");
      } else {
        await createStock.mutateAsync({
          productId,
          costPrice,
          sellingPrice,
          quantity: stockType === "SERIALIZED" ? 1 : quantity,
          withVat,
          serialNumber: serialNumber.trim() ? serialNumber.trim() : null, // Optional
          batchNumber: batchNumber.trim() ? batchNumber.trim() : null, // Optional
        });
        toast.success("Stock intake recorded successfully");
      }

      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to save stock.");
    }
  };

  const isSaving = createStock.isPending || updateStock.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/40">
          <div className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              {isEditing ? "Edit Stock Batch / Serial" : "Record New Stock Intake"}
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Intake Format Switcher */}
          {!isEditing && (
            <div className="space-y-1.5">
              <label className="font-medium text-foreground">Inventory Intake Format</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStockType("SERIALIZED");
                    setQuantity(1);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${stockType === "SERIALIZED"
                      ? "border-primary bg-primary/10 text-primary font-semibold shadow-sm"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                    }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    <Barcode className="w-4 h-4" />
                    Individual Unit
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 font-normal">
                    Single device (Serial # optional). Qty = 1.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setStockType("BATCH")}
                  className={`p-2.5 rounded-xl border text-left transition-all ${stockType === "BATCH"
                      ? "border-primary bg-primary/10 text-primary font-semibold shadow-sm"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                    }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    <Boxes className="w-4 h-4" />
                    Batch / Bulk Lot
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 font-normal">
                    Batch code (RAM, Toners, Accessories). Qty &ge; 1.
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Product Selection */}
          {!isEditing ? (
            <div className="space-y-1.5">
              <label className="font-medium text-foreground">
                Target Product <span className="text-destructive">*</span>
              </label>
              {!selectedProduct ? (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search product name or SKU..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="pl-9 h-9 text-xs bg-background"
                    />
                  </div>

                  {isLoadingProducts && (
                    <div className="p-2 text-center text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin mx-auto text-primary" />
                    </div>
                  )}

                  {productsList.length > 0 && (
                    <div className="max-h-36 overflow-y-auto divide-y divide-border border border-border rounded-xl bg-background">
                      {productsList.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSelectedProduct(p);
                            setProductId(p.id);
                            if (p.withVat !== undefined) setWithVat(p.withVat);
                          }}
                          className="w-full p-2 text-left hover:bg-muted/50 transition-colors flex justify-between items-center"
                        >
                          <div>
                            <p className="font-semibold text-foreground">{p.name}</p>
                            <span className="font-mono text-[10px] text-muted-foreground">{p.sku}</span>
                          </div>
                          <span className="text-[10px] text-primary font-medium">Select</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-2.5 rounded-xl border border-border bg-muted/20 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-foreground">{selectedProduct.name}</p>
                    <span className="font-mono text-[10px] text-muted-foreground">{selectedProduct.sku}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedProduct(null);
                      setProductId("");
                    }}
                    className="h-7 text-xs text-muted-foreground hover:text-destructive"
                  >
                    Change
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-2.5 rounded-xl border border-border bg-muted/20">
              <p className="font-bold text-foreground">{stock.products?.name}</p>
              <span className="font-mono text-[10px] text-muted-foreground">{stock.products?.sku}</span>
            </div>
          )}

          {/* Serial Number & Batch Number Inputs (Serial # is Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {stockType === "SERIALIZED" ? (
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-medium text-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Barcode className="w-3.5 h-3.5 text-primary" />
                    Hardware Serial Number (Optional)
                  </span>
                  <span className="text-[10px] text-muted-foreground font-normal">Leave blank if non-serialized</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. SN-DELL-9834201"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="h-9 text-xs font-mono uppercase bg-background"
                />
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="font-medium text-foreground">Batch / Lot Code (Optional)</label>
                  <Input
                    type="text"
                    placeholder="e.g. BATCH-2026-Q1"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="h-9 text-xs font-mono bg-background"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-foreground">
                    Units Quantity <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="h-9 text-xs bg-background"
                    required
                  />
                </div>
              </>
            )}
          </div>

          {/* Pricing Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-medium text-foreground flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                Unit Cost Price (Wholesale) <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                min={0}
                placeholder="0.00"
                value={costPrice}
                onChange={(e) => setCostPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                className="h-9 text-xs bg-background font-mono font-semibold"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-medium text-foreground flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                Unit Selling Price (Retail) <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                min={0}
                placeholder="0.00"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                className="h-9 text-xs bg-background font-mono font-semibold"
                required
              />
            </div>
          </div>

          {/* Live Profit Margin Indicator */}
          <div className="p-3 rounded-xl bg-muted/40 border border-border grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-muted-foreground block">Cost Markup:</span>
              <span className={`font-mono font-bold ${markupPercent >= 20 ? "text-emerald-500" : "text-amber-500"}`}>
                +{markupPercent.toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Gross Margin:</span>
              <span className="font-mono font-bold text-primary">
                {marginPercent.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* VAT Status */}
          <div className="space-y-1.5">
            <label className="font-medium text-foreground">Tax Classification</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setWithVat(true)}
                className={`p-2 rounded-xl border text-left transition-all ${withVat
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-500 font-semibold"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  VAT Product (15%)
                </div>
              </button>

              <button
                type="button"
                onClick={() => setWithVat(false)}
                className={`p-2 rounded-xl border text-left transition-all ${!withVat
                    ? "border-rose-500 bg-rose-500/10 text-rose-500 font-semibold"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <XCircle className="w-3.5 h-3.5 text-rose-500" />
                  Non-VAT / Exempt
                </div>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex justify-end gap-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSaving}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSaving || (!isEditing && !productId)}
              className="text-xs bg-primary text-primary-foreground font-semibold"
            >
              {isSaving ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                </span>
              ) : isEditing ? (
                "Save Stock Changes"
              ) : (
                "Record Stock Intake"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
