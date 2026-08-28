"use client";

import React, { useState, useEffect } from "react";
import { useCategories } from "@/features/category/hooks/use-categories";
import { useProducts, type ProductItem, type ProductStock } from "@/features/product/hooks/use-products";
import { useCheckoutSale } from "@/features/transaction/hooks/use-transactions";
import { ProductCard } from "@/features/product/components/product-card";
import { PosSerialDialog } from "@/features/pos/components/pos-serial-dialog";
import { PosCheckoutDialog } from "@/features/pos/components/pos-checkout-dialog";
import { PosReceiptDialog } from "@/features/pos/components/pos-receipt-dialog";
import {
  Search,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Loader2,
  Sparkles,
  ArrowRight,
  X,
  AlertTriangle,
  Barcode,
  Boxes,
} from "lucide-react";
import { toast } from "sonner";

interface CartItem {
  stockId: string;
  productId: string;
  name: string;
  sku: string;
  serialNumber?: string | null;
  batchNumber?: string | null;
  price: number; // Negotiated selling price
  costPrice: number; // Wholesale cost floor
  defaultPrice: number;
  quantity: number;
  maxQuantity: number;
  withVat: boolean;
}

// ─────────────────────────────────────────────────────────────
// Sub-Component: Focus-Safe Price Input (Supports clearing & decimals)
// ─────────────────────────────────────────────────────────────
function CartPriceInput({
  price,
  costPrice,
  onPriceChange,
}: {
  price: number;
  costPrice: number;
  onPriceChange: (newPrice: number) => void;
}) {
  const [localVal, setLocalVal] = useState(price.toString());

  useEffect(() => {
    setLocalVal(price.toString());
  }, [price]);

  const numVal = parseFloat(localVal);
  const isBelowCost = !isNaN(numVal) && numVal < costPrice;

  return (
    <div
      className={`flex items-center rounded-lg border overflow-hidden transition-all ${isBelowCost
          ? "border-destructive bg-destructive/10 ring-1 ring-destructive"
          : "border-border bg-background focus-within:ring-1 focus-within:ring-primary"
        }`}
    >
      <span className="bg-muted/80 px-2 py-1 text-[10px] font-bold font-mono text-muted-foreground border-r border-border select-none">
        ETB
      </span>
      <input
        type="text"
        inputMode="decimal"
        value={localVal}
        placeholder="0.00"
        onChange={(e) => {
          const val = e.target.value;
          // Allow empty string, numbers, and a single decimal point
          if (val === "" || /^\d*\.?\d*$/.test(val)) {
            setLocalVal(val);
            const parsed = parseFloat(val);
            onPriceChange(isNaN(parsed) ? 0 : parsed);
          }
        }}
        className="w-24 px-2 py-0.5 text-xs font-bold font-mono bg-transparent border-0 text-foreground focus:outline-none"
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Sub-Component: Focus-Safe Quantity Input (Supports clearing)
// ─────────────────────────────────────────────────────────────
function CartQuantityInput({
  quantity,
  maxQuantity,
  onQuantityChange,
}: {
  quantity: number;
  maxQuantity: number;
  onQuantityChange: (newQty: number) => void;
}) {
  const [localVal, setLocalVal] = useState(quantity.toString());

  useEffect(() => {
    setLocalVal(quantity.toString());
  }, [quantity]);

  return (
    <div className="flex items-center gap-1 bg-muted/80 rounded-lg border border-border p-0.5">
      <button
        type="button"
        onClick={() => {
          const next = Math.max(1, quantity - 1);
          setLocalVal(next.toString());
          onQuantityChange(next);
        }}
        disabled={quantity <= 1}
        className="p-1 hover:text-primary disabled:opacity-30 transition-colors"
        title="Decrease quantity"
      >
        <Minus className="w-3 h-3" />
      </button>

      <input
        type="text"
        inputMode="numeric"
        value={localVal}
        placeholder="1"
        onChange={(e) => {
          const val = e.target.value;
          if (val === "" || /^\d+$/.test(val)) {
            setLocalVal(val);
            const num = parseInt(val, 10);
            if (!isNaN(num) && num >= 1) {
              if (num > maxQuantity) {
                toast.error(`Max available stock is ${maxQuantity}`);
                onQuantityChange(maxQuantity);
                setLocalVal(maxQuantity.toString());
              } else {
                onQuantityChange(num);
              }
            }
          }
        }}
        onBlur={() => {
          const num = parseInt(localVal, 10);
          if (isNaN(num) || num < 1) {
            setLocalVal("1");
            onQuantityChange(1);
          }
        }}
        className="w-9 text-center text-xs font-bold font-mono bg-background rounded border border-border/50 text-foreground py-0.5 focus:outline-none focus:ring-1 focus:ring-primary"
      />

      <button
        type="button"
        onClick={() => {
          if (quantity < maxQuantity) {
            const next = quantity + 1;
            setLocalVal(next.toString());
            onQuantityChange(next);
          } else {
            toast.error(`Max available stock is ${maxQuantity}`);
          }
        }}
        disabled={quantity >= maxQuantity}
        className="p-1 hover:text-primary disabled:opacity-30 transition-colors"
        title="Increase quantity"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main POS Page
// ─────────────────────────────────────────────────────────────
export default function PosPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isMobileCartOpen, setIsMobileOpen] = useState(false);

  // Modals
  const [dialogProduct, setDialogProduct] = useState<ProductItem | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [lastInvoice, setLastInvoice] = useState<any | null>(null);

  const { data: categories = [] } = useCategories();
  const { data: productsData, isLoading: isLoadingProducts } = useProducts(search, selectedCategory);
  const checkoutSale = useCheckoutSale();

  const handleProductSelect = (product: ProductItem) => {
    const availableStocks = product.stocks?.filter((s) => s.quantity > 0) || [];
    if (availableStocks.length === 0) {
      toast.error("Item is completely out of stock");
      return;
    }

    const hasMultipleStocks = availableStocks.length > 1;
    const hasSerials = availableStocks.some((s) => !s.serialNumber);

    if (hasMultipleStocks || hasSerials) {
      setDialogProduct(product);
    } else {
      const stock = availableStocks[0];
      addStockToCart(product, stock);
    }
  };

  const addStockToCart = (product: ProductItem, stock: ProductStock) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.stockId === stock.id);

      if (existing) {
        if (stock.serialNumber) {
          toast.error(`Serial #${stock.serialNumber} is already in the cart`);
          return prev;
        }

        if (existing.quantity >= stock.quantity) {
          toast.error(`Cannot add more. Available in batch: ${stock.quantity}`);
          return prev;
        }

        return prev.map((item) =>
          item.stockId === stock.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [
        ...prev,
        {
          stockId: stock.id,
          productId: product.id,
          name: product.name,
          sku: product.sku,
          serialNumber: stock.serialNumber,
          batchNumber: stock.batchNumber,
          price: stock.sellingPrice,
          costPrice: stock.costPrice,
          defaultPrice: stock.sellingPrice,
          quantity: 1,
          maxQuantity: stock.serialNumber ? 1 : stock.quantity,
          withVat: stock.withVat,
        },
      ];
    });

    toast.success(
      stock.serialNumber
        ? `Added Serial ${stock.serialNumber}`
        : `Added ${product.name}`
    );
  };

  const handleSelectFromDialog = (stock: ProductStock) => {
    if (!dialogProduct) return;
    addStockToCart(dialogProduct, stock);
  };

  const setItemPrice = (stockId: string, newPrice: number) => {
    setCart((prev) =>
      prev.map((item) => (item.stockId === stockId ? { ...item, price: newPrice } : item))
    );
  };

  const setItemQuantity = (stockId: string, newQty: number) => {
    setCart((prev) =>
      prev.map((item) => (item.stockId === stockId ? { ...item, quantity: newQty } : item))
    );
  };

  const removeFromCart = (stockId: string) => {
    setCart((prev) => prev.filter((item) => item.stockId !== stockId));
  };

  // Calculations
  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const vatAmount = cart.reduce(
    (acc, item) => (item.withVat ? acc + item.price * item.quantity * 0.15 : acc),
    0
  );
  const total = subtotal + vatAmount;

  // Check if any item is below wholesale cost
  const hasBelowCostItem = cart.some((i) => i.price < i.costPrice);

  const handleConfirmCheckout = async ({
    paymentMethod,
    customerName,
    customerPhone,
  }: {
    paymentMethod: "CASH" | "CARD" | "TRANSFER";
    customerName?: string;
    customerPhone?: string;
  }) => {
    if (hasBelowCostItem) {
      toast.error("One or more items are below wholesale cost. Adjust price before checkout.");
      return;
    }

    try {
      const result = await checkoutSale.mutateAsync({
        items: cart.map((item) => ({
          stockId: item.stockId,
          quantity: item.quantity,
          price: item.price,
        })),
        paymentMethod,
        customerName,
        customerPhone,
      });

      toast.success(`Sale completed! Invoice #${result.invoiceNumber}`);

      setLastInvoice({
        invoiceNumber: result.invoiceNumber,
        items: cart.map((c) => ({
          name: c.name,
          serialNumber: c.serialNumber,
          quantity: c.quantity,
          price: c.price,
        })),
        subtotal,
        vat: vatAmount,
        total,
        paymentMethod,
        customerName: customerName || "Walk-in Customer",
        customerPhone: customerPhone || "N/A",
        createdAt: new Date().toISOString(),
      });

      setCart([]);
      setIsCheckoutOpen(false);
      setIsMobileOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Checkout failed");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-6.5rem)] gap-4 overflow-visible lg:overflow-hidden relative pb-20 lg:pb-0">
      {/* Product Catalog Column */}
      <div className="flex-1 flex flex-col bg-card rounded-2xl border border-border overflow-hidden min-h-[500px]">
        <div className="p-3.5 border-b border-border space-y-2.5 bg-muted/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Scan barcode, SKU, or search name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 text-xs rounded-xl border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory("ALL")}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium whitespace-nowrap transition-colors ${selectedCategory === "ALL"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium whitespace-nowrap transition-colors ${selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          {isLoadingProducts ? (
            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mb-2 text-primary" />
              <p className="text-xs">Loading hardware inventory...</p>
            </div>
          ) : productsData?.data.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
              <ShoppingBag className="w-10 h-10 opacity-20 mb-2" />
              <p className="text-xs">No products matching "{search}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {productsData?.data.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={handleProductSelect}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Cart Column (Directly inlined to prevent React focus unmounting) */}
      <div className="hidden lg:flex w-80 xl:w-96 flex-shrink-0 flex-col bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-3.5 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-semibold text-foreground">Current Cart</h2>
          </div>
          <span className="text-[11px] font-medium text-muted-foreground">
            {totalCartCount} items
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {cart.length === 0 ? (
            <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-muted-foreground">
              <Sparkles className="w-8 h-8 opacity-10 mb-2" />
              <p className="text-xs">Cart is empty</p>
              <p className="text-[10px] text-muted-foreground/60">Tap products to add</p>
            </div>
          ) : (
            cart.map((item) => {
              const isBelowCost = item.price < item.costPrice;

              return (
                <div
                  key={item.stockId}
                  className="p-2.5 rounded-xl border border-border bg-background space-y-2"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="text-xs font-semibold text-foreground line-clamp-1">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px] font-mono">
                        {item.serialNumber ? (
                          <span className="text-primary bg-primary/10 px-1 rounded font-bold flex items-center gap-1">
                            <Barcode className="w-3 h-3" />
                            SN: {item.serialNumber}
                          </span>
                        ) : (
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Boxes className="w-3 h-3" />
                            {item.batchNumber ? `Batch: ${item.batchNumber}` : "Standard Batch"} (Max: {item.maxQuantity})
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.stockId)}
                      className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-border/40 gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-muted-foreground font-medium">Price:</span>
                      <CartPriceInput
                        price={item.price}
                        costPrice={item.costPrice}
                        onPriceChange={(newP) => setItemPrice(item.stockId, newP)}
                      />
                    </div>

                    {!item.serialNumber ? (
                      <CartQuantityInput
                        quantity={item.quantity}
                        maxQuantity={item.maxQuantity}
                        onQuantityChange={(newQ) => setItemQuantity(item.stockId, newQ)}
                      />
                    ) : (
                      <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        Qty: 1
                      </span>
                    )}
                  </div>

                  {/* Warning is shown without taking focus away */}
                  {isBelowCost && (
                    <div className="text-[10px] text-destructive font-semibold flex items-center gap-1 pt-0.5">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      Below cost (ETB {item.costPrice.toFixed(2)}). Checkout locked.
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="p-3.5 border-t border-border bg-muted/20 space-y-3">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-mono">ETB {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>VAT (15%)</span>
              <span className="font-mono">ETB {vatAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-foreground pt-1.5 border-t border-border/60">
              <span>Total</span>
              <span className="font-mono text-primary">ETB {total.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="button"
            disabled={cart.length === 0 || hasBelowCostItem}
            onClick={() => setIsCheckoutOpen(true)}
            className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-xs transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm"
          >
            {hasBelowCostItem
              ? "Price Below Cost (Locked)"
              : `Checkout (ETB ${total.toFixed(2)})`}
          </button>
        </div>
      </div>

      {/* Mobile Trigger & Drawer */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-semibold px-4 flex items-center justify-between shadow-2xl active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-2 text-xs">
            <ShoppingBag className="w-4 h-4" />
            <span>{totalCartCount} in Cart</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold font-mono">
            <span>ETB {total.toFixed(2)}</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* Multi-Batch & Serial Dialog */}
      {dialogProduct && (
        <PosSerialDialog
          product={dialogProduct}
          isOpen={!!dialogProduct}
          onClose={() => setDialogProduct(null)}
          onSelectStock={handleSelectFromDialog}
        />
      )}

      <PosCheckoutDialog
        isOpen={isCheckoutOpen}
        totalAmount={total}
        isLoading={checkoutSale.isPending}
        onClose={() => setIsCheckoutOpen(false)}
        onConfirm={handleConfirmCheckout}
      />

      <PosReceiptDialog
        isOpen={!!lastInvoice}
        invoiceData={lastInvoice}
        onClose={() => setLastInvoice(null)}
      />
    </div>
  );
}
