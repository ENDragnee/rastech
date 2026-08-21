"use client";

import { useState } from "react";
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
  defaultPrice: number; // Default retail selling price
  quantity: number;
  maxQuantity: number;
  withVat: boolean;
}

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

  // Intelligent Stock Add Logic
  const handleProductSelect = (product: ProductItem) => {
    const availableStocks = product.stocks?.filter((s) => s.quantity > 0) || [];
    if (availableStocks.length === 0) {
      toast.error("Item is completely out of stock");
      return;
    }

    // If product has multiple stocks (multiple batches or serialized devices), open selection dialog
    const hasMultipleStocks = availableStocks.length > 1;
    const hasSerials = availableStocks.some((s) => !!s.serialNumber);

    if (hasMultipleStocks || hasSerials) {
      setDialogProduct(product);
    } else {
      // Single Batch Item: Directly add to cart!
      const stock = availableStocks[0];
      addStockToCart(product, stock);
    }
  };

  // Helper to add specific stock record to cart
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

  // Quantity Controls
  const updateQuantity = (stockId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.stockId === stockId) {
            if (item.serialNumber) return item;
            const newQty = item.quantity + delta;
            if (newQty > item.maxQuantity) {
              toast.error(`Max stock available in this batch: ${item.maxQuantity}`);
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleQuantityInput = (stockId: string, rawValue: string) => {
    const parsed = parseInt(rawValue, 10);
    setCart((prev) =>
      prev.map((item) => {
        if (item.stockId === stockId) {
          if (item.serialNumber) return item;
          if (isNaN(parsed) || parsed < 1) return { ...item, quantity: 1 };
          if (parsed > item.maxQuantity) {
            toast.error(`Max available: ${item.maxQuantity}`);
            return { ...item, quantity: item.maxQuantity };
          }
          return { ...item, quantity: parsed };
        }
        return item;
      })
    );
  };

  // Negotiable Custom Unit Price Input
  const handlePriceInput = (stockId: string, rawValue: string) => {
    const parsed = parseFloat(rawValue) || 0;
    setCart((prev) =>
      prev.map((item) => {
        if (item.stockId === stockId) {
          return { ...item, price: parsed };
        }
        return item;
      })
    );
  };

  const removeFromCart = (stockId: string) => {
    setCart((prev) => prev.filter((item) => item.stockId !== stockId));
  };

  // Total Calculations
  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const vatAmount = cart.reduce(
    (acc, item) => (item.withVat ? acc + item.price * item.quantity * 0.15 : acc),
    0
  );
  const total = subtotal + vatAmount;

  // Checkout Execution
  const handleConfirmCheckout = async ({
    paymentMethod,
    customerName,
    customerPhone,
  }: {
    paymentMethod: "CASH" | "CARD" | "TRANSFER";
    customerName?: string;
    customerPhone?: string;
  }) => {
    // Client-side cost floor pre-validation
    const belowCostItem = cart.find((i) => i.price < i.costPrice);
    if (belowCostItem) {
      toast.error(
        `Unit price for "${belowCostItem.name}" (ETB ${belowCostItem.price.toFixed(2)}) is below wholesale cost (ETB ${belowCostItem.costPrice.toFixed(2)}). Requires Manager Approval.`
      );
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

  // Reusable Cart Content View
  const CartContent = () => (
    <div className="flex flex-col h-full bg-card">
      <div className="p-3.5 border-b border-border flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-primary" />
          <h2 className="text-xs font-semibold text-foreground">Current Cart</h2>
        </div>
        <span className="text-[11px] font-medium text-muted-foreground">
          {totalCartCount} items
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
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
                className="p-2.5 rounded-lg border border-border bg-background space-y-2"
              >
                {/* Product Name & Identifier */}
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
                    className="text-muted-foreground hover:text-destructive p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Price Negotiation & Quantity Controls */}
                <div className="flex items-center justify-between pt-1 border-t border-border/40 gap-2">
                  {/* Negotiable Price Input */}
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-muted-foreground">Price:</span>
                    <div className="relative flex items-center">
                      <span className="absolute left-1.5 text-xs text-muted-foreground font-mono">ETB</span>
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        value={item.price}
                        onChange={(e) => handlePriceInput(item.stockId, e.target.value)}
                        className={`w-20 pl-4 pr-1 py-0.5 text-xs font-bold font-mono rounded border bg-background focus:outline-none ${isBelowCost
                            ? "border-destructive text-destructive bg-destructive/10 ring-1 ring-destructive"
                            : "border-border text-foreground focus:ring-1 focus:ring-primary"
                          }`}
                      />
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  {!item.serialNumber ? (
                    <div className="flex items-center gap-1 bg-muted/80 rounded-md border border-border/80 p-0.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.stockId, -1)}
                        disabled={item.quantity <= 1}
                        className="p-1 hover:text-primary disabled:opacity-30"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={item.maxQuantity}
                        value={item.quantity}
                        onChange={(e) => handleQuantityInput(item.stockId, e.target.value)}
                        className="w-9 text-center text-xs font-bold font-mono bg-background rounded border border-border/50 text-foreground py-0.5 focus:outline-none focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.stockId, 1)}
                        disabled={item.quantity >= item.maxQuantity}
                        className="p-1 hover:text-primary disabled:opacity-30"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      Qty: 1
                    </span>
                  )}
                </div>

                {/* Below Cost Warning */}
                {isBelowCost && (
                  <div className="text-[10px] text-destructive font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Below wholesale cost (ETB {item.costPrice.toFixed(2)}). Requires Manager Approval.
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Checkout Footer */}
      <div className="p-3.5 border-t border-border bg-muted/20 space-y-3">
        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span> ETB {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>VAT (15%)</span>
            <span> ETB {vatAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-sm text-foreground pt-1.5 border-t border-border/60">
            <span>Total</span>
            <span> ETB {total.toFixed(2)}</span>
          </div>
        </div>

        <button
          type="button"
          disabled={cart.length === 0 || cart.some((i) => i.price < i.costPrice)}
          onClick={() => setIsCheckoutOpen(true)}
          className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-xs transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm"
        >
          Checkout (ETB {total.toFixed(2)})
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-6.5rem)] gap-4 overflow-visible lg:overflow-hidden relative pb-20 lg:pb-0">
      {/* Product Catalog Column */}
      <div className="flex-1 flex flex-col bg-card rounded-2xl border border-border overflow-hidden min-h-[500px]">
        {/* Top Filters */}
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

      {/* Desktop Cart Column */}
      <div className="hidden lg:flex w-80 xl:w-96 flex-shrink-0 flex-col bg-card rounded-2xl border border-border overflow-hidden">
        <CartContent />
      </div>

      {/* Mobile Floating Cart Trigger Pill */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-semibold px-4 flex items-center justify-between shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-2 text-xs">
            <ShoppingBag className="w-4 h-4" />
            <span>
              {totalCartCount} {totalCartCount === 1 ? "Item" : "Items"} in Cart
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold font-mono">
            <span> ETB {total.toFixed(2)}</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* Mobile Slide-Up Cart Sheet */}
      {isMobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-h-[85vh] h-[85vh] bg-card rounded-t-3xl border-t border-border shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="p-3 border-b border-border flex justify-between items-center bg-muted/40">
              <span className="text-xs font-bold text-foreground">Shopping Cart</span>
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <CartContent />
            </div>
          </div>
        </div>
      )}

      {/* Intelligent Multi-Batch / Serial Dialog */}
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
