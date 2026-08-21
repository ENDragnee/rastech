"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calculator,
  ArrowLeft,
  BookOpen,
  TrendingUp,
  Layers,
  Percent,
  DollarSign,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ManagerMetricsDocsPage() {
  // Interactive Simulator States
  const [simSales, setSimSales] = useState<number>(50000);
  const [simMarkup, setSimMarkup] = useState<number>(25); // %
  const [simStockValue, setSimStockValue] = useState<number>(20000);

  // Computed Values for Simulator
  const simCOGS = simSales / (1 + simMarkup / 100);
  const simProfit = simSales - simCOGS;
  const simMargin = (simProfit / simSales) * 100;
  const simTurnover = simStockValue > 0 ? simCOGS / simStockValue : 0;
  const simDaysToSell = simTurnover > 0 ? 365 / simTurnover : 0;
  const simStockToSales = simSales > 0 ? simStockValue / simSales : 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Header */}
      <div className="space-y-2 border-b border-border pb-4">
        <Link href="/manager/dashboard">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Button>
        </Link>
        <div className="flex items-center gap-2.5 pt-1">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Managerial Metrics Guide &amp; Interactive Simulator
            </h1>
            <p className="text-xs text-muted-foreground">
              Mathematical formulas, financial benchmarks, and interactive strategy forecasting for electronics retail.
            </p>
          </div>
        </div>
      </div>

      {/* INTERACTIVE SIMULATOR SANDBOX */}
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-bold text-foreground">
              Interactive Inventory &amp; Profitability Simulator
            </h2>
          </div>
          <span className="text-[11px] bg-primary/20 text-primary font-semibold px-2 py-0.5 rounded-full">
            Real-time Sandbox
          </span>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Adjust the sliders below to see how changes in your pricing markup and warehouse inventory levels directly impact your <strong>Gross Margin</strong>, <strong>Turnover Velocity</strong>, and <strong>Days to Sell</strong>.
        </p>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Slider 1: Sales Target */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Target Sales Revenue</span>
              <span className="font-bold text-foreground font-mono">${simSales.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={5000}
              max={200000}
              step={2500}
              value={simSales}
              onChange={(e) => setSimSales(Number(e.target.value))}
              className="w-full accent-primary h-1.5 bg-muted rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-[10px] text-muted-foreground">Gross annual sales goal</span>
          </div>

          {/* Slider 2: Product Markup */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Average Product Markup</span>
              <span className="font-bold text-foreground font-mono">{simMarkup}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={100}
              step={1}
              value={simMarkup}
              onChange={(e) => setSimMarkup(Number(e.target.value))}
              className="w-full accent-primary h-1.5 bg-muted rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-[10px] text-muted-foreground">Wholesale cost markup %</span>
          </div>

          {/* Slider 3: Stock Value */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Warehouse Stock Valuation</span>
              <span className="font-bold text-foreground font-mono">${simStockValue.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={2000}
              max={100000}
              step={1000}
              value={simStockValue}
              onChange={(e) => setSimStockValue(Number(e.target.value))}
              className="w-full accent-primary h-1.5 bg-muted rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-[10px] text-muted-foreground">Capital trapped in warehouse</span>
          </div>
        </div>

        {/* Live Simulation Results */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-primary/20">
          <div className="p-3 rounded-xl bg-card border border-border">
            <span className="text-[10px] text-muted-foreground">Projected Gross Profit</span>
            <div className="text-base font-bold text-emerald-500 font-mono">
              ${simProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">{simMargin.toFixed(1)}% margin</span>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border">
            <span className="text-[10px] text-muted-foreground">Cost of Goods (COGS)</span>
            <div className="text-base font-bold text-foreground font-mono">
              ${simCOGS.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <span className="text-[10px] text-muted-foreground">Wholesale expense</span>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border">
            <span className="text-[10px] text-muted-foreground">Inventory Turnover</span>
            <div className="text-base font-bold text-primary font-mono">
              {simTurnover.toFixed(2)}x / year
            </div>
            <span className={`text-[10px] font-semibold ${simTurnover >= 2.5 ? "text-emerald-500" : "text-amber-500"}`}>
              {simTurnover >= 3 ? "Excellent Velocity" : simTurnover >= 2 ? "Healthy" : "Capital Trapped"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border">
            <span className="text-[10px] text-muted-foreground">Days to Liquidate</span>
            <div className="text-base font-bold text-foreground font-mono">
              {Math.round(simDaysToSell)} Days
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">{simStockToSales.toFixed(2)} stock-to-sales</span>
          </div>
        </div>
      </div>

      {/* METRICS REFERENCE ACCORDION / GUIDE */}
      <div className="space-y-4">
        <h2 className="text-base font-bold tracking-tight text-foreground">
          Core Financial &amp; Inventory Formulas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Turnover Rate */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-primary font-semibold text-xs">
              <Layers className="w-4 h-4" />
              <span>1. Inventory Turnover Rate</span>
            </div>
            <div className="p-2.5 rounded bg-muted font-mono text-[11px] text-foreground">
              Turnover Rate = Cost of Goods Sold (COGS) / Average Stock Value
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Measures how many times inventory is sold and replenished over a given period.
            </p>
            <div className="text-[11px] space-y-1 text-muted-foreground border-t border-border pt-2">
              <p><strong>Healthy Benchmark:</strong> 2.5x – 4.5x for electronics stores.</p>
              <p><strong>Risk:</strong> Values &lt; 1.5x indicate overstocking and rapid depreciation risk for CPUs/GPUs/Laptops.</p>
            </div>
          </div>

          {/* Card 2: Gross Profit Margin vs Markup */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-500 font-semibold text-xs">
              <Percent className="w-4 h-4" />
              <span>2. Margin % vs. Markup %</span>
            </div>
            <div className="p-2.5 rounded bg-muted font-mono text-[11px] text-foreground">
              Margin % = ((Revenue - Cost) / Revenue) &times; 100
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Margin is the percentage of selling price that is profit. Markup is the percentage added on top of wholesale cost.
            </p>
            <div className="text-[11px] space-y-1 text-muted-foreground border-t border-border pt-2">
              <p><strong>Example:</strong> Bought for $100, sold for $125.</p>
              <p><strong>Markup:</strong> 25% | <strong>Margin:</strong> 20%</p>
            </div>
          </div>

          {/* Card 3: Stock-to-Sales Ratio */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-blue-500 font-semibold text-xs">
              <TrendingUp className="w-4 h-4" />
              <span>3. Stock-to-Sales Ratio</span>
            </div>
            <div className="p-2.5 rounded bg-muted font-mono text-[11px] text-foreground">
              Stock-to-Sales = Warehouse Asset Value / Period Revenue
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Assesses if your warehouse capital is in balance with current customer demand.
            </p>
            <div className="text-[11px] space-y-1 text-muted-foreground border-t border-border pt-2">
              <p><strong>Optimal Range:</strong> 0.8 to 1.5.</p>
              <p><strong>High Ratio (&gt;2.5):</strong> Too much working capital locked up in static hardware.</p>
            </div>
          </div>

          {/* Card 4: Defect & Shrinkage Loss */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-destructive font-semibold text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>4. Defect &amp; Shrinkage Loss</span>
            </div>
            <div className="p-2.5 rounded bg-muted font-mono text-[11px] text-foreground">
              Loss Value = &sum; (Defective Units &times; Wholesale Cost Price)
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tracks financial leakage from dead-on-arrival (DOA) units, customer warranty write-offs, and warehouse damage.
            </p>
            <div className="text-[11px] space-y-1 text-muted-foreground border-t border-border pt-2">
              <p><strong>Action:</strong> Use high defect rates on specific brands (e.g. SSD batches) to process supplier RMAs.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
