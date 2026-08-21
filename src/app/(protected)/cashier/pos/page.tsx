"use client";

import { useState } from "react";
import { useCategories } from "@/features/category/hooks/use-categories";
import { useProducts, type ProductItem, type ProductStock } from "@/features/product/hooks/use-products";
import { useCheckoutSale } from "@/features/transaction/hooks/use-transactions";
import { ProductCard } from "@/features/product/components/product-card";
import { PosSerialDialog } from "@/features/pos/components/pos-serial-dialog";
import { PosCheckoutDialog } from "@/features/pos/components/pos-checkout-dialog";
import { PosReceiptDialog } from "@/features/pos/components/pos-receipt-dialog";
import { Search, ShoppingBag, Plus, Minus, Trash2, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface CartItem {
  stockId: string;
  productId: string;
  name: string;
  sku: string;
  serialNumber?: string | null;
  batchNumber?: string | null;
  price: number;
  quantity: number;
  maxQuantity: number;
  withVat: boolean;
}

export default function PosPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [cart, setCart] = useState<CartItem[]>([]);

  // Modals state
  const [serialProduct, setSerialProduct] = useState<ProductItem | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [lastInvoice, setLastInvoice] = useState<any | null>(null);

  // Queries & Mutations
  const { data: categories = [] } = useCategories();
  const { data: productsData, isLoading: isLoadingProducts } = useProducts(search, selectedCategory);
  const checkoutSale = useCheckoutSale();

  // Handlers for Cart
  const handleProductSelect = (product: ProductItem) => {
    const availableStocks = product.stocks?.filter((s) => s.quantity > 0) || [];
    if (availableStocks.length === 0) {
      toast.error("Item is completely out of stock");
      return;
    }

    const isSerialized = availableStocks.some((s) => !!s.serialNumber);

    if (isSerialized) {
      setSerialProduct(product);
    } else {
      const stock = availableStocks[0];
      setCart((prev) => {
        const existing = prev.find((item) => item.stockId === stock.id);
        if (existing) {
          if (existing.quantity >= stock.quantity) {
            toast.error(`Cannot add more. Maximum available stock is ${stock.quantity}`);
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
            batchNumber: stock.batchNumber,
            price: stock.sellingPrice,
            quantity: 1,
            maxQuantity: stock.quantity,
            withVat: stock.withVat,
          },
        ];
      });
      toast.success(`Added ${product.name} to cart`);
    }
  };

  const handleSelectSerialStock = (stock: ProductStock) => {
    if (!serialProduct) return;

    if (cart.some((item) => item.stockId === stock.id)) {
      toast.error(`Serial #${stock.serialNumber} is already in the cart`);
      return;
    }

    setCart((prev) => [
      ...prev,
      {
        stockId: stock.id,
        productId: serialProduct.id,
        name: serialProduct.name,
        sku: serialProduct.sku,
        serialNumber: stock.serialNumber,
        price: stock.sellingPrice,
        quantity: 1,
        maxQuantity: 1, // Fixed to 1 for serials
        withVat: stock.withVat,
      },
    ]);
    toast.success(`Added Serial ${stock.serialNumber}`);
  };

  // Button +/- modifier
  const updateQuantity = (stockId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.stockId === stockId) {
            if (item.serialNumber) return item; // Serialized items locked at 1
            const newQty = item.quantity + delta;

            if (newQty > item.maxQuantity) {
              toast.error(`Maximum available stock reached (${item.maxQuantity})`);
              return item;
            }

            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Direct numeric input handler
  const handleQuantityInput = (stockId: string, rawValue: string) => {
    const parsed = parseInt(rawValue, 10);

    setCart((prev) =>
      prev.map((item) => {
        if (item.stockId === stockId) {
          if (item.serialNumber) return item;

          if (isNaN(parsed) || parsed < 1) {
            return { ...item, quantity: 1 };
          }

          if (parsed > item.maxQuantity) {
            toast.error(`Cannot exceed stock limit of ${item.maxQuantity}`);
            return { ...item, quantity: item.maxQuantity };
          }

          return { ...item, quantity: parsed };
        }
        return item;
      })
    );
  };

  const removeFromCart = (stockId: string) => {
    setCart((prev) => prev.filter((item) => item.stockId !== stockId));
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const vatAmount = cart.reduce(
    (acc, item) => (item.withVat ? acc + item.price * item.quantity * 0.15 : acc),
    0
  );
  const total = subtotal + vatAmount;

  // Single Atomic Checkout Call
  const handleConfirmCheckout = async ({
    paymentMethod,
    customerName,
    customerPhone,
  }: {
    paymentMethod: "CASH" | "CARD" | "TRANSFER";
    customerName: string;
    customerPhone: string;
  }) => {
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

      // Open Receipt Modal
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
        customerName,
        customerPhone,
        createdAt: new Date().toISOString(),
      });

      setCart([]);
      setIsCheckoutOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Checkout failed. Please try again.");
    }
  };

  return (
    <div className="flex h-[calc(100vh-5.5rem)] gap-4 overflow-hidden">
      {/* Product Catalog Column */}
      <div className="flex-1 flex flex-col bg-card rounded-xl border border-border overflow-hidden">
        {/* Top Filter Bar */}
        <div className="p-3 border-b border-border space-y-2.5 bg-muted/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Scan barcode, SKU, or search hardware..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory("ALL")}
              className={`px-3 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition-colors ${selectedCategory === "ALL"
                ? "bg-primary text-primary-foreground"
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
                className={`px-3 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition-colors ${selectedCategory === cat.id
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
        <div className="flex-1 overflow-y-auto p-4">
          {isLoadingProducts ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mb-2 text-primary" />
              <p className="text-xs">Loading hardware inventory...</p>
            </div>
          ) : productsData?.data.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <ShoppingBag className="w-10 h-10 opacity-20 mb-2" />
              <p className="text-xs">No products found matching "{search}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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

      {/* POS Cart Column */}
      <div className="w-96 flex-shrink-0 flex flex-col bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-3.5 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-semibold text-foreground">Current Cart</h2>
          </div>
          <span className="text-[11px] font-medium text-muted-foreground">
            {cart.reduce((a, b) => a + b.quantity, 0)} items
          </span>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <Sparkles className="w-8 h-8 opacity-10 mb-2" />
              <p className="text-xs">Cart is empty</p>
              <p className="text-[11px] text-muted-foreground/60">Click on products to add</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.stockId}
                className="p-2.5 rounded-lg border border-border bg-background space-y-2"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="text-xs font-medium text-foreground line-clamp-1">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {item.serialNumber ? (
                        <span className="text-[10px] font-mono text-primary bg-primary/10 px-1 rounded font-semibold">
                          SN: {item.serialNumber}
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">
                          Max: {item.maxQuantity} available
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.stockId)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex justify-between items-center pt-1 border-t border-border/40">
                  <span className="text-xs font-bold text-foreground">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>

                  {!item.serialNumber ? (
                    <div className="flex items-center gap-1 bg-muted/80 rounded-md border border-border/80 p-0.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.stockId, -1)}
                        disabled={item.quantity <= 1}
                        className="p-1 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Decrease"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      {/* Direct Numeric Input */}
                      <input
                        type="number"
                        min={1}
                        max={item.maxQuantity}
                        value={item.quantity}
                        onChange={(e) => handleQuantityInput(item.stockId, e.target.value)}
                        className="w-10 text-center text-xs font-bold bg-background rounded border border-border/50 text-foreground py-0.5 focus:outline-none focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />

                      <button
                        type="button"
                        onClick={() => updateQuantity(item.stockId, 1)}
                        disabled={item.quantity >= item.maxQuantity}
                        className="p-1 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Increase"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] font-mono font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      Qty: 1
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals & Checkout Button */}
        <div className="p-3.5 border-t border-border bg-muted/20 space-y-3">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>VAT (15%)</span>
              <span>${vatAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-foreground pt-1.5 border-t border-border/60">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="button"
            disabled={cart.length === 0}
            onClick={() => setIsCheckoutOpen(true)}
            className="w-full h-10 rounded-lg bg-primary text-primary-foreground font-semibold text-xs transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm"
          >
            Proceed to Payment (${total.toFixed(2)})
          </button>
        </div>
      </div>

      {/* Modals */}
      {serialProduct && (
        <PosSerialDialog
          product={serialProduct}
          isOpen={!!serialProduct}
          onClose={() => setSerialProduct(null)}
          onSelectStock={handleSelectSerialStock}
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
