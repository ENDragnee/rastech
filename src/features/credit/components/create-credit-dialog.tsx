"use client";

import { useState } from "react";
import { useCreateCredit } from "../hooks/use-credits";
import { useProducts, type ProductStock } from "@/features/product/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Handshake, Loader2, Search, X, Barcode, Boxes, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface CreateCreditDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateCreditDialog({ isOpen, onClose }: CreateCreditDialogProps) {
  const [productSearch, setProductSearch] = useState("");
  const [selectedStock, setSelectedStock] = useState<ProductStock | null>(null);
  const [productName, setProductName] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerIdDoc, setCustomerIdDoc] = useState("");

  // String states prevent sticky "0" glitch and allow smooth clearing
  const [quantity, setQuantity] = useState("1");
  const [totalAmount, setTotalAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  const { data: productsData } = useProducts(productSearch);
  const createCredit = useCreateCredit();

  if (!isOpen) return null;

  const maxAvailable = selectedStock?.quantity || 1;
  const isSerialized = !!selectedStock?.serialNumber;

  // Real-time Validation Checks
  const parsedQty = parseInt(quantity, 10);
  const isQtyInvalidNumber = !quantity || isNaN(parsedQty) || parsedQty <= 0;
  const isExceedingStock = selectedStock ? parsedQty > selectedStock.quantity : false;
  const isFormInvalid =
    !selectedStock ||
    !customerName.trim() ||
    isExceedingStock ||
    isQtyInvalidNumber ||
    !totalAmount;

  const handleSelectStock = (st: ProductStock, name: string) => {
    setSelectedStock(st);
    setProductName(name);
    setQuantity("1");
    setTotalAmount(st.sellingPrice.toFixed(2));
    setProductSearch("");
  };

  const handleQuantityChange = (val: string) => {
    // Allow typing only digits or empty string
    if (val === "" || /^\d+$/.test(val)) {
      setQuantity(val);
      const q = parseInt(val, 10);

      if (!isNaN(q) && q > 0 && selectedStock) {
        setTotalAmount((selectedStock.sellingPrice * q).toFixed(2));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStock) {
      toast.error("Please select a physical stock item or serial number");
      return;
    }

    if (isExceedingStock) {
      toast.error(`Quantity cannot exceed available stock (${selectedStock.quantity})`);
      return;
    }

    const parsedTotal = parseFloat(totalAmount) || 0;

    try {
      await createCredit.mutateAsync({
        stockId: selectedStock.id,
        quantity: parsedQty,
        totalAmount: parsedTotal,
        customerName,
        customerPhone: customerPhone.trim() || undefined,
        customerIdDoc: customerIdDoc.trim() || undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      });

      toast.success(`Credit issued to ${customerName}`);
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to issue credit");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/40">
          <div className="flex items-center gap-2">
            <Handshake className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Issue Item on Credit</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Product / Stock Search Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Select Stock Item / Serial Number</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search product name, SKU, or serial..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="pl-9 h-8 text-xs bg-background"
              />
            </div>

            {/* Results List */}
            {productSearch && (
              <div className="max-h-36 overflow-y-auto space-y-1 rounded-xl border border-border bg-background p-1.5 shadow-inner">
                {productsData?.data.flatMap((p) =>
                  (p.stocks || []).filter((s) => s.quantity > 0).map((st) => (
                    <button
                      type="button"
                      key={st.id}
                      onClick={() => handleSelectStock(st, p.name)}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted/80 text-left text-xs transition-colors group"
                    >
                      <div>
                        <span className="font-semibold text-foreground">{p.name}</span>
                        {st.serialNumber ? (
                          <span className="text-[10px] text-primary font-mono ml-2">SN: {st.serialNumber}</span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground ml-2">
                            Batch ({st.quantity} in stock)
                          </span>
                        )}
                      </div>
                      <span className="font-semibold font-mono text-foreground">ETB {st.sellingPrice.toFixed(2)}</span>
                    </button>
                  ))
                )}
              </div>
            )}

            {selectedStock && (
              <div className="p-3 rounded-xl border border-primary/30 bg-primary/5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-foreground">{productName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {selectedStock.serialNumber ? (
                      <span className="font-mono text-[10px] text-primary flex items-center gap-1">
                        <Barcode className="w-3 h-3" /> SN: {selectedStock.serialNumber}
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Boxes className="w-3 h-3" /> Batch: {selectedStock.batchNumber || "Standard"} &bull; In Stock: {selectedStock.quantity}
                      </span>
                    )}
                  </div>
                </div>
                <span className="font-bold text-sm text-foreground font-mono">
                  ETB {selectedStock.sellingPrice.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Customer Credentials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Customer Full Name</label>
              <Input
                type="text"
                placeholder="Full Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="h-8 text-xs bg-background"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground flex justify-between">
                <span>Phone Number</span>
                <span className="text-[10px] text-muted-foreground font-normal">Optional</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. +251 9..."
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="h-8 text-xs bg-background"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">National ID / Passport (Optional)</label>
              <Input
                type="text"
                placeholder="ID Doc Number"
                value={customerIdDoc}
                onChange={(e) => setCustomerIdDoc(e.target.value)}
                className="h-8 text-xs bg-background"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Payment Due Date</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-8 text-xs bg-background"
              />
            </div>
          </div>

          {/* Quantity & Total Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-medium">
                <span className={isExceedingStock ? "text-destructive font-semibold" : "text-foreground"}>
                  Quantity
                </span>
                {selectedStock && (
                  <span className={`text-[10px] font-mono ${isExceedingStock ? "text-destructive font-bold" : "text-muted-foreground"}`}>
                    Available: {selectedStock.quantity}
                  </span>
                )}
              </div>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="1"
                disabled={isSerialized}
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className={`h-8 text-xs bg-background font-semibold transition-colors ${isExceedingStock
                    ? "border-destructive text-destructive bg-destructive/10 ring-1 ring-destructive"
                    : ""
                  }`}
                required
              />
              {/* Inline Error Text */}
              {isExceedingStock && (
                <p className="text-[10px] text-destructive font-medium flex items-center gap-1 pt-0.5 animate-in fade-in">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  Exceeds inventory limit ({maxAvailable})
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Agreed Total Debt (ETB)</label>
              <Input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={totalAmount}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "" || /^\d*\.?\d*$/.test(v)) setTotalAmount(v);
                }}
                className="h-8 text-xs bg-background font-bold text-primary font-mono"
                required
              />
            </div>
          </div>

          {/* Action Footer with Greyed-Out Submit Button */}
          <div className="pt-2 flex justify-end gap-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={createCredit.isPending}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createCredit.isPending || isFormInvalid}
              className="text-xs font-semibold bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {createCredit.isPending ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Issuing...
                </span>
              ) : isExceedingStock ? (
                "Stock Limit Exceeded"
              ) : (
                "Issue Credit"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
