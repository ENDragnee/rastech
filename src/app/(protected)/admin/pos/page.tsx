"use client";

import { useState } from "react";
import { Search, Plus, Minus, Trash2, ShoppingBag, CreditCard, Banknote, Landmark } from "lucide-react";

// Mock data for the POS interface (Replace with React-Query fetching)
const MOCK_PRODUCTS = [
  { id: "1", name: "Dell XPS 15", category: "LAPTOP_COMPUTER", sku: "DL-XPS-15", price: 1500, stock: 10, withVat: true },
  { id: "2", name: "Logitech MX Master 3", category: "COMPUTER_ACCESSORIES", sku: "LOG-MX3", price: 100, stock: 45, withVat: false },
  { id: "3", name: "HP LaserJet Pro", category: "DESKTOP_AND_PRINTER", sku: "HP-LJ-P", price: 250, stock: 5, withVat: true },
  { id: "4", name: "Samsung 1TB SSD", category: "HARDDRIVE_AND_RAM", sku: "SAM-1TB-S", price: 120, stock: 30, withVat: true },
];

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  withVat: boolean;
};

export default function PointOfSale() {
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  
  const filteredProducts = MOCK_PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1, withVat: product.withVat }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const vatAmount = cart.reduce((acc, item) => item.withVat ? acc + (item.price * item.quantity * 0.15) : acc, 0); // Assuming 15% VAT
  const total = subtotal + vatAmount;

  return (
    <div className="flex h-full gap-6">
      {/* Left side: Products Grid */}
      <div className="flex-1 flex flex-col h-full bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Scan barcode or search by name/SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-10 pr-4 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
              autoFocus
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <button 
                key={product.id}
                onClick={() => addToCart(product)}
                className="flex flex-col text-left p-4 rounded-xl border border-border/60 bg-background hover:border-primary/50 hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start w-full mb-2">
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">{product.sku}</span>
                  {/* VAT Indicator */}
                  {product.withVat ? (
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" title="With VAT" />
                  ) : (
                    <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" title="No VAT" />
                  )}
                </div>
                <h3 className="font-semibold text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">{product.name}</h3>
                <div className="mt-auto pt-2 w-full flex justify-between items-end">
                  <span className="text-sm text-muted-foreground">{product.stock} in stock</span>
                  <span className="font-bold text-lg text-foreground">${product.price.toFixed(2)}</span>
                </div>
              </button>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-muted-foreground">
                <ShoppingBag className="h-12 w-12 mb-4 opacity-20" />
                <p>No products found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right side: Active Cart */}
      <div className="w-[400px] flex-shrink-0 flex flex-col h-full bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Current Sale
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
              <ShoppingBag className="h-16 w-16 opacity-10" />
              <p>Cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex flex-col p-3 rounded-lg border border-border bg-background">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-foreground line-clamp-1">{item.name}</span>
                      {item.withVat && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500">VAT</span>}
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                    <div className="flex items-center gap-3 bg-muted rounded-md border border-border/50">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-primary transition-colors">
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="font-semibold text-sm w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-primary transition-colors">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Checkout Section */}
        <div className="p-4 border-t border-border bg-muted/30 space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>VAT (15%)</span>
              <span>${vatAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-xl text-foreground pt-2 border-t border-border/50">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          
          <button 
            disabled={cart.length === 0}
            onClick={() => setIsCheckoutOpen(true)}
            className="w-full h-14 rounded-lg bg-primary text-primary-foreground font-bold text-lg shadow-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            Checkout
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">Complete Checkout</h2>
              <p className="text-sm text-muted-foreground mt-1">Total Amount: <span className="font-bold text-primary">${total.toFixed(2)}</span></p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Payment Method */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground">Payment Method</label>
                <div className="grid grid-cols-3 gap-3">
                  <button 
                    onClick={() => setPaymentMethod("CASH")}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border ${paymentMethod === "CASH" ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:bg-muted"} transition-all`}
                  >
                    <Banknote className="h-6 w-6 mb-2" />
                    <span className="text-xs font-semibold">Cash</span>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod("CARD")}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border ${paymentMethod === "CARD" ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:bg-muted"} transition-all`}
                  >
                    <CreditCard className="h-6 w-6 mb-2" />
                    <span className="text-xs font-semibold">Card</span>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod("TRANSFER")}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border ${paymentMethod === "TRANSFER" ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:bg-muted"} transition-all`}
                  >
                    <Landmark className="h-6 w-6 mb-2" />
                    <span className="text-xs font-semibold">Transfer</span>
                  </button>
                </div>
              </div>

              {/* Customer Info (Optional) */}
              <div className="space-y-3 pt-2">
                <label className="text-sm font-semibold text-foreground flex items-center justify-between">
                  Customer Information 
                  <span className="text-xs font-normal text-muted-foreground">(For Warranty)</span>
                </label>
                <input 
                  type="text" 
                  placeholder="Customer Name"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input 
                  type="text" 
                  placeholder="Phone Number"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="p-4 border-t border-border bg-muted/30 flex gap-3 justify-end">
              <button 
                onClick={() => setIsCheckoutOpen(false)}
                className="px-4 py-2 rounded-md font-medium text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  alert("Transaction Complete!");
                  setCart([]);
                  setIsCheckoutOpen(false);
                }}
                className="px-6 py-2 rounded-md font-medium text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-md"
              >
                Confirm Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
