"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Banknote, CreditCard, Landmark, Loader2, X, ShieldCheck } from "lucide-react";

interface PosCheckoutDialogProps {
  isOpen: boolean;
  totalAmount: number;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: (checkoutData: {
    paymentMethod: "CASH" | "CARD" | "TRANSFER";
    customerName?: string;
    customerPhone?: string;
  }) => void;
}

export function PosCheckoutDialog({
  isOpen,
  totalAmount,
  isLoading,
  onClose,
  onConfirm,
}: PosCheckoutDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "TRANSFER">("CASH");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      paymentMethod,
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-border flex justify-between items-center bg-muted/30">
          <div>
            <h2 className="text-base font-semibold text-foreground">Complete Checkout</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Total Amount:{" "}
              <span className="font-bold text-primary text-sm"> ETB {totalAmount.toFixed(2)}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("CASH")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${paymentMethod === "CASH"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
              >
                <Banknote className="w-5 h-5 mb-1.5" />
                Cash
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("CARD")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${paymentMethod === "CARD"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
              >
                <CreditCard className="w-5 h-5 mb-1.5" />
                Card
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("TRANSFER")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${paymentMethod === "TRANSFER"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
              >
                <Landmark className="w-5 h-5 mb-1.5" />
                Transfer
              </button>
            </div>
          </div>

          {/* Customer Details (Optional for warranty) */}
          <div className="space-y-2.5 pt-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                Warranty Registration
              </label>
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                Optional
              </span>
            </div>

            <Input
              type="text"
              placeholder="Customer Full Name (Optional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="h-9 text-xs bg-background"
            />
            <Input
              type="text"
              placeholder="Phone Number (Optional)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="h-9 text-xs bg-background"
            />
          </div>

          <div className="pt-2 flex gap-2 justify-end border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={onClose}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="text-xs font-semibold bg-primary text-primary-foreground"
            >
              {isLoading ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Processing...
                </span>
              ) : (
                "Confirm Sale"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
