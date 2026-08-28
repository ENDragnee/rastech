"use client";

import { useState, useEffect } from "react";
import { useCreateStock, useUpdateStock, type StockItem } from "../hooks/use-stocks";
import { useProducts } from "@/features/product/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Boxes, Loader2, X, Barcode } from "lucide-react";
import { toast } from "sonner";

interface StockFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  stock?: StockItem | null;
}

export function StockFormDialog({ isOpen, onClose, stock }: StockFormDialogProps) {
  const isEdit = !!stock;

  const [productId, setProductId] = useState("");
  const [stockType, setStockType] = useState<"SERIALIZED" | "BATCH">("BATCH");
  const [serialNumber, setSerialNumber] = useState("");
  const [batchNumber, setBatchNumber] = useState("");

  // String states prevent the sticky "0" glitch
  const [quantity, setQuantity] = useState("1");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [withVat, setWithVat] = useState(true);

  const { data: productsData } = useProducts();
  const createStock = useCreateStock();
  const updateStock = useUpdateStock();

  useEffect(() => {
    if (stock) {
      setProductId(stock.productId || "");
      setStockType(stock.serialNumber ? "SERIALIZED" : "BATCH");
      setSerialNumber(stock.serialNumber || "");
      setBatchNumber(stock.batchNumber || "");
      setQuantity(stock.quantity.toString());
      setCostPrice(stock.costPrice.toString());
      setSellingPrice(stock.sellingPrice.toString());
      setWithVat(stock.withVat ?? true);
    } else {
      setProductId("");
      setStockType("BATCH");
      setSerialNumber("");
      setBatchNumber("");
      setQuantity("1");
      setCostPrice("");
      setSellingPrice("");
      setWithVat(true);
    }
  }, [stock, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) {
      toast.error("Please select a product");
      return;
    }

    const parsedCost = parseFloat(costPrice) || 0;
    const parsedSelling = parseFloat(sellingPrice) || 0;
    const parsedQty = stockType === "SERIALIZED" ? 1 : parseInt(quantity, 10) || 1;

    try {
      if (isEdit && stock) {
        await updateStock.mutateAsync({
          id: stock.id,
          costPrice: parsedCost,
          sellingPrice: parsedSelling,
          quantity: parsedQty,
          withVat,
          serialNumber: stockType === "SERIALIZED" ? serialNumber.trim() || null : null,
          batchNumber: stockType === "BATCH" ? batchNumber.trim() || null : null,
        });
        toast.success("Stock batch updated");
      } else {
        await createStock.mutateAsync({
          productId,
          costPrice: parsedCost,
          sellingPrice: parsedSelling,
          quantity: parsedQty,
          withVat,
          serialNumber: stockType === "SERIALIZED" ? serialNumber.trim() || null : null,
          batchNumber: stockType === "BATCH" ? batchNumber.trim() || null : null,
        });
        toast.success("Stock intake recorded");
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to save stock");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/40">
          <div className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              {isEdit ? "Edit Inventory Batch" : "Record Physical Stock Intake"}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Product Selector */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Select Product</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              disabled={isEdit}
              required
              className="w-full h-8 px-2.5 text-xs bg-background border border-input rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">-- Choose Product Model --</option>
              {productsData?.data.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>

          {/* Type Toggle */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Stock Tracking Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStockType("BATCH")}
                className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${stockType === "BATCH"
                    ? "border-primary bg-primary/10 text-primary font-semibold"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
              >
                Bulk Quantity Batch
              </button>
              <button
                type="button"
                onClick={() => setStockType("SERIALIZED")}
                className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${stockType === "SERIALIZED"
                    ? "border-primary bg-primary/10 text-primary font-semibold"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
              >
                Unique Serial Number
              </button>
            </div>
          </div>

          {/* Identifier Input */}
          {stockType === "SERIALIZED" ? (
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <Barcode className="w-3.5 h-3.5 text-primary" /> Physical Serial Number
              </label>
              <Input
                type="text"
                placeholder="e.g. SN-DELL-9823140"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="h-8 text-xs bg-background font-mono font-semibold"
                required
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Batch Code (Optional)</label>
                <Input
                  type="text"
                  placeholder="e.g. BATCH-2026-Q3"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  className="h-8 text-xs bg-background font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Intake Quantity</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="1"
                  value={quantity}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "" || /^\d+$/.test(v)) setQuantity(v);
                  }}
                  className="h-8 text-xs bg-background font-semibold"
                  required
                />
              </div>
            </div>
          )}

          {/* Prices */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Wholesale Cost Price (ETB)</label>
              <Input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={costPrice}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "" || /^\d*\.?\d*$/.test(v)) setCostPrice(v);
                }}
                className="h-8 text-xs bg-background font-mono"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Retail Selling Price (ETB)</label>
              <Input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={sellingPrice}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "" || /^\d*\.?\d*$/.test(v)) setSellingPrice(v);
                }}
                className="h-8 text-xs bg-background font-mono font-bold text-primary"
                required
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createStock.isPending || updateStock.isPending}
              className="text-xs bg-primary font-semibold"
            >
              {createStock.isPending || updateStock.isPending ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                </span>
              ) : (
                "Save Stock"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
