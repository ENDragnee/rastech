"use client";

import { useState } from "react";
import { useCreateCredit } from "../hooks/use-credits";
import { useProducts, type ProductStock } from "@/features/product/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Handshake, Loader2, Search, X, Barcode } from "lucide-react";
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

  // String states prevent the sticky "0" glitch
  const [quantity, setQuantity] = useState("1");
  const [totalAmount, setTotalAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  const { data: productsData } = useProducts(productSearch);
  const createCredit = useCreateCredit();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStock) {
      toast.error("Please select a physical stock item or serial number");
      return;
    }

    const parsedQty = parseInt(quantity, 10) || 1;
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
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/40">
          <div className="flex items-center gap-2">
            <Handshake className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Issue Item on Credit</h2>
          </div>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Product / Serial Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Select Stock Item / Serial</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search product name or SKU..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="pl-9 h-8 text-xs bg-background"
              />
            </div>

            {productSearch && (
              <div className="max-h-36 overflow-y-auto space-y-1 rounded-lg border border-border bg-background p-1.5">
                {productsData?.data.flatMap((p) =>
                  (p.stocks || []).filter((s) => s.quantity > 0).map((st) => (
                    <button
                      type="button"
                      key={st.id}
                      onClick={() => {
                        setSelectedStock(st);
                        setProductName(p.name);
                        setTotalAmount(st.sellingPrice.toString());
                        setProductSearch("");
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-md hover:bg-muted text-left text-xs transition-colors"
                    >
                      <div>
                        <span className="font-medium text-foreground">{p.name}</span>
                        {st.serialNumber && (
                          <span className="text-[10px] text-primary font-mono ml-2">SN: {st.serialNumber}</span>
                        )}
                      </div>
                      <span className="font-semibold font-mono">ETB {st.sellingPrice.toFixed(2)}</span>
                    </button>
                  ))
                )}
              </div>
            )}

            {selectedStock && (
              <div className="p-2.5 rounded-lg border border-primary/30 bg-primary/5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-foreground">{productName}</p>
                  {selectedStock.serialNumber ? (
                    <span className="font-mono text-[10px] text-primary flex items-center gap-1">
                      <Barcode className="w-3 h-3" /> SN: {selectedStock.serialNumber}
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">Batch: {selectedStock.batchNumber || "General"}</span>
                  )}
                </div>
                <span className="font-bold text-sm text-foreground font-mono">ETB {selectedStock.sellingPrice.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Customer Credentials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Customer Name</label>
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

          {/* Quantity & Agreed Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Quantity</label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="1"
                disabled={!selectedStock?.serialNumber}
                value={quantity}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "" || /^\d+$/.test(v)) {
                    setQuantity(v);
                    const q = parseInt(v, 10) || 1;
                    if (selectedStock) {
                      setTotalAmount((selectedStock.sellingPrice * q).toFixed(2));
                    }
                  }
                }}
                className="h-8 text-xs bg-background font-semibold"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Agreed Debt Amount (ETB)</label>
              <Input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={totalAmount}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "" || /^\d*\.?\d*$/.test(v)) {
                    setTotalAmount(v);
                  }
                }}
                className="h-8 text-xs bg-background font-bold text-primary font-mono"
                required
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={createCredit.isPending} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={createCredit.isPending || !selectedStock} className="text-xs font-semibold bg-primary">
              {createCredit.isPending ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Issuing...
                </span>
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
