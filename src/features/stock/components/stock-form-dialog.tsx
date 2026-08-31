"use client";

import { useState, useEffect } from "react";
import { useCreateStock, useUpdateStock, type StockItem } from "../hooks/use-stocks";
import { useProducts, type ProductItem } from "@/features/product/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Boxes,
  Loader2,
  X,
  Barcode,
  Search,
  Package,
  RefreshCw,
  Check,
} from "lucide-react";
import { toast } from "sonner";

interface StockFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  stock?: StockItem | null;
}

export function StockFormDialog({ isOpen, onClose, stock }: StockFormDialogProps) {
  const isEdit = !!stock;

  // Product Selection & Search State
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  // Form Fields
  const [stockType, setStockType] = useState<"SERIALIZED" | "BATCH">("BATCH");
  const [serialNumber, setSerialNumber] = useState("");
  const [batchNumber, setBatchNumber] = useState("");

  // String states prevent sticky "0" glitches
  const [quantity, setQuantity] = useState("1");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [withVat, setWithVat] = useState(true);

  const { data: productsData, isLoading: isSearchingProducts } = useProducts(productSearch);
  const createStock = useCreateStock();
  const updateStock = useUpdateStock();

  // Initialize or reset form state
  useEffect(() => {
    if (stock) {
      if (stock.products) {
        setSelectedProduct(stock.products as unknown as ProductItem);
      }
      setStockType(stock.serialNumber ? "SERIALIZED" : "BATCH");
      setSerialNumber(stock.serialNumber || "");
      setBatchNumber(stock.batchNumber || "");
      setQuantity(stock.quantity.toString());
      setCostPrice(stock.costPrice.toString());
      setSellingPrice(stock.sellingPrice.toString());
      setWithVat(stock.withVat ?? true);
      setProductSearch("");
    } else {
      setSelectedProduct(null);
      setStockType("BATCH");
      setSerialNumber("");
      setBatchNumber("");
      setQuantity("1");
      setCostPrice("");
      setSellingPrice("");
      setWithVat(true);
      setProductSearch("");
    }
  }, [stock, isOpen]);

  if (!isOpen) return null;

  const handleSelectProduct = (product: ProductItem) => {
    setSelectedProduct(product);
    setProductSearch("");
    // If product has an existing stock price, optionally prefill
    if (product.stocks && product.stocks.length > 0) {
      const latestStock = product.stocks[0];
      if (!costPrice) setCostPrice(latestStock.costPrice.toString());
      if (!sellingPrice) setSellingPrice(latestStock.sellingPrice.toString());
    }
  };

  const handleClearProduct = () => {
    setSelectedProduct(null);
    setProductSearch("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct?.id) {
      toast.error("Please search and select a product model");
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
          productId: selectedProduct.id,
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
      toast.error(err?.response?.data?.error || "Failed to save stock record");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/40">
          <div className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              {isEdit ? "Edit Inventory Batch" : "Record Physical Stock Intake"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Product Search & Select Component */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex justify-between items-center">
              <span>Target Product Model</span>
              {selectedProduct && (
                <button
                  type="button"
                  onClick={handleClearProduct}
                  className="text-[11px] text-primary hover:underline flex items-center gap-1 font-semibold"
                >
                  <RefreshCw className="w-3 h-3" /> Change Product
                </button>
              )}
            </label>

            {!selectedProduct ? (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by product name, model, or SKU..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-9 h-9 text-xs bg-background"
                    autoFocus
                  />
                </div>

                {/* Dropdown Results List */}
                <div className="max-h-40 overflow-y-auto rounded-xl border border-border bg-background p-1 space-y-1 shadow-inner">
                  {isSearchingProducts ? (
                    <div className="py-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> Searching products...
                    </div>
                  ) : productsData?.data.length === 0 ? (
                    <div className="py-4 text-center text-xs text-muted-foreground">
                      No products found matching &ldquo;{productSearch}&rdquo;
                    </div>
                  ) : (
                    productsData?.data.map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => handleSelectProduct(p)}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted/80 text-left text-xs transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
                          <div>
                            <p className="font-semibold text-foreground">{p.name}</p>
                            <span className="font-mono text-[10px] text-muted-foreground">{p.sku}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-primary font-medium opacity-0 group-hover:opacity-100 flex items-center gap-0.5">
                          Select <Check className="w-3 h-3" />
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : (
              /* Selected Product Badge */
              <div className="p-3 rounded-xl border border-primary/30 bg-primary/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-foreground">{selectedProduct.name}</p>
                    <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {selectedProduct.sku}
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClearProduct}
                  className="h-7 text-xs gap-1 border-border bg-background"
                >
                  <RefreshCw className="w-3 h-3" /> Change
                </Button>
              </div>
            )}
          </div>

          {/* Stock Tracking Type */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-medium text-foreground">Stock Tracking Method</label>
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

          {/* Serial vs Batch Input Fields */}
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

          {/* Pricing Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Wholesale Cost (ETB)</label>
              <div className="flex items-center rounded-xl border border-border bg-background overflow-hidden focus-within:ring-1 focus-within:ring-primary">
                <span className="bg-muted/80 px-2 py-1 text-[10px] font-bold font-mono text-muted-foreground border-r border-border select-none">
                  ETB
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={costPrice}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "" || /^\d*\.?\d*$/.test(v)) setCostPrice(v);
                  }}
                  className="w-full px-2 py-1 text-xs font-mono font-bold bg-transparent border-0 text-foreground focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Retail Selling Price (ETB)</label>
              <div className="flex items-center rounded-xl border border-border bg-background overflow-hidden focus-within:ring-1 focus-within:ring-primary">
                <span className="bg-muted/80 px-2 py-1 text-[10px] font-bold font-mono text-muted-foreground border-r border-border select-none">
                  ETB
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={sellingPrice}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "" || /^\d*\.?\d*$/.test(v)) setSellingPrice(v);
                  }}
                  className="w-full px-2 py-1 text-xs font-mono font-bold bg-transparent border-0 text-primary focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Dialog Footer Actions */}
          <div className="pt-3 flex justify-end gap-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createStock.isPending || updateStock.isPending || !selectedProduct}
              className="text-xs bg-primary font-semibold text-primary-foreground"
            >
              {createStock.isPending || updateStock.isPending ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                </span>
              ) : (
                "Save Stock Intake"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
