"use client";

import { useState } from "react";
import { Search, Filter, Plus, FileDown, MoreHorizontal } from "lucide-react";

const MOCK_INVENTORY = [
  { id: "1", sku: "DL-XPS-15", name: "Dell XPS 15", category: "LAPTOP_COMPUTER", cost: 1200, price: 1500, stock: 10, status: "HEALTHY", vat: true },
  { id: "2", sku: "LOG-MX3", name: "Logitech MX Master 3", category: "COMPUTER_ACCESSORIES", cost: 50, price: 100, stock: 45, status: "HEALTHY", vat: false },
  { id: "3", sku: "HP-LJ-P", name: "HP LaserJet Pro", category: "DESKTOP_AND_PRINTER", cost: 180, price: 250, stock: 5, status: "LOW_STOCK", vat: true },
  { id: "4", sku: "SAM-1TB-S", name: "Samsung 1TB SSD", category: "HARDDRIVE_AND_RAM", cost: 80, price: 120, stock: 0, status: "OUT_OF_STOCK", vat: true },
];

export default function StockPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground mt-1">Track and update all active stock, pricing, and VAT status.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-muted transition-colors">
            <FileDown className="mr-2 h-4 w-4" /> Export CSV
          </button>
          <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors">
            <Plus className="mr-2 h-4 w-4" /> Add Stock
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/20">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search inventory by name, SKU, or Category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted transition-colors">
              <Filter className="mr-2 h-4 w-4" /> Filter Categories
            </button>
          </div>
        </div>
        
        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Product Name & SKU</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Cost / Price</th>
                <th className="px-6 py-4 font-medium">VAT</th>
                <th className="px-6 py-4 font-medium">Stock Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MOCK_INVENTORY.map((item) => (
                <tr key={item.id} className="bg-background hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-foreground">{item.name}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">{item.sku}</div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold">
                      {item.category.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-muted-foreground text-xs">Cost: ${item.cost.toFixed(2)}</div>
                    <div className="font-medium text-foreground mt-0.5">Price: ${item.price.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4">
                    {item.vat ? (
                      <span className="flex items-center gap-1.5 text-emerald-500 font-medium text-xs">
                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                        Yes
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-rose-500 font-medium text-xs">
                        <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-base w-8">{item.stock}</div>
                      {item.status === "HEALTHY" && <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">Healthy</span>}
                      {item.status === "LOW_STOCK" && <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500 bg-amber-500/10 px-2 py-1 rounded">Low Stock</span>}
                      {item.status === "OUT_OF_STOCK" && <span className="text-[10px] uppercase font-bold tracking-wider text-rose-500 bg-rose-500/10 px-2 py-1 rounded">Out of Stock</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground bg-muted/10">
          <div>Showing 1 to 4 of 4 results</div>
          <div className="flex gap-1">
            <button className="px-3 py-1 rounded border border-border disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 rounded border border-border disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
