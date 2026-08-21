"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Plus, Package } from "lucide-react";

export default function AddStockPage() {
  const [category, setCategory] = useState("COMPUTER_ACCESSORIES");

  // Determine dynamic fields based on category
  const requiresSerialNumber = ["LAPTOP_COMPUTER", "DESKTOP_AND_PRINTER", "NETWORK_AND_SECURITY_CAMERAS"].includes(category);
  const requiresWarranty = ["LAPTOP_COMPUTER", "DESKTOP_AND_PRINTER", "HARDDRIVE_AND_RAM", "NETWORK_AND_SECURITY_CAMERAS"].includes(category);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link href="/stock" className="p-2 -ml-2 rounded-full hover:bg-muted text-muted-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Add New Stock</h1>
            <p className="text-muted-foreground mt-1">Create a new product or add stock to an existing one.</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/20">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Product Details
          </h2>
        </div>
        
        <form className="p-6 space-y-8" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Standard Fields */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">Product Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
              >
                <option value="COMPUTER_ACCESSORIES">Computer Accessories</option>
                <option value="DESKTOP_AND_PRINTER">Desktop & Printer</option>
                <option value="NETWORK_AND_SECURITY_CAMERAS">Network & Security Cameras</option>
                <option value="LAPTOP_COMPUTER">Laptop Computer</option>
                <option value="HARDDRIVE_AND_RAM">Harddrive & RAM</option>
                <option value="TONERS">Toners</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">Product Name</label>
              <input 
                type="text" 
                placeholder="e.g. Dell XPS 15 9500"
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground flex items-center justify-between">
                SKU 
                <button type="button" className="text-xs text-primary hover:underline">Auto-generate</button>
              </label>
              <input 
                type="text" 
                placeholder="e.g. DL-XPS-15"
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono uppercase"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">Batch Number (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g. BATCH-2023-A"
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>

            {/* Dynamic Fields */}
            {requiresSerialNumber && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  Serial Number
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">Required for Laptops/Desktops</span>
                </label>
                <input 
                  type="text" 
                  placeholder="Enter unique serial number"
                  className="w-full h-10 px-3 rounded-md border border-primary/50 bg-primary/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            )}

            {requiresWarranty && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  Warranty Period (Days)
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">Required</span>
                </label>
                <input 
                  type="number" 
                  placeholder="e.g. 365"
                  className="w-full h-10 px-3 rounded-md border border-primary/50 bg-primary/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            )}
          </div>
          
          <hr className="border-border" />

          <h3 className="text-lg font-bold text-foreground">Pricing & Stock</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">Initial Quantity</label>
              <input 
                type="number" 
                min="0"
                placeholder="0"
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">Cost Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">ETB</span>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-full h-10 pl-8 pr-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">Selling Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">ETB</span>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-full h-10 pl-8 pr-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono text-emerald-500"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border">
            <input type="checkbox" id="vat" className="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary" defaultChecked />
            <label htmlFor="vat" className="text-sm font-medium text-foreground cursor-pointer">
              Apply standard VAT (15%) to this product
            </label>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Link 
              href="/stock"
              className="px-6 py-2.5 rounded-md font-medium text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-transparent hover:border-border"
            >
              Cancel
            </Link>
            <button 
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-2.5 text-sm font-bold text-primary-foreground shadow-lg hover:bg-primary/90 transition-all active:scale-95"
            >
              <Save className="mr-2 h-4 w-4" /> Save Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
