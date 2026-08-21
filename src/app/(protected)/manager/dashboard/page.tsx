"use client";

import { useState } from "react";
import Link from "next/link";
import { useDashboardAnalytics } from "@/features/analytics/hooks/use-dashboard-analytics";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  Boxes,
  Loader2,
  RefreshCw,
  Search,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CATEGORY_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];

export default function ManagerDashboardPage() {
  const [timeframe, setTimeframe] = useState<"WEEK" | "MONTH" | "YEAR">("WEEK");
  const [activeTab, setActiveTab] = useState<"overview" | "items" | "reorder" | "defects">("overview");
  const [itemSearch, setItemSearch] = useState("");

  const { data, isLoading, refetch, isFetching } = useDashboardAnalytics(timeframe);

  if (isLoading || !data) {
    return (
      <div className="h-[calc(100vh-8rem)] flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm font-medium">Aggregating hardware inventory analytics...</p>
      </div>
    );
  }

  const { performance, health, timeline, categorySales, bestSellers, itemPerformance, defectMetrics, lowStockItems } = data;

  const filteredItemPerformance = itemPerformance.filter(
    (item) =>
      item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
      item.sku.toLowerCase().includes(itemSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Navigation Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Executive Analytics &amp; Inventory Hub
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time capital valuation, gross profit margins, and hardware stock velocity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe Filter Buttons */}
          <div className="flex rounded-lg border border-border bg-card p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setTimeframe("WEEK")}
              className={`px-2.5 py-1 rounded-md transition-colors ${timeframe === "WEEK"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              7 Days
            </button>
            <button
              type="button"
              onClick={() => setTimeframe("MONTH")}
              className={`px-2.5 py-1 rounded-md transition-colors ${timeframe === "MONTH"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              30 Days
            </button>
            <button
              type="button"
              onClick={() => setTimeframe("YEAR")}
              className={`px-2.5 py-1 rounded-md transition-colors ${timeframe === "YEAR"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              12 Months
            </button>
          </div>

          <Link href="/manager/docs">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 border-primary/40 text-primary hover:bg-primary/10">
              <BookOpen className="w-3.5 h-3.5" />
              Metrics Guide &amp; Simulator
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-xs gap-1.5"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. Revenue */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Realized Revenue</span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground"> ETB {performance.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-500 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span> ETB {performance.grossProfit.toFixed(2)} Profit ({performance.grossMarginPercentage.toFixed(1)}% margin)</span>
          </div>
        </div>

        {/* 2. Asset Valuation */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Cost Basis Asset Value</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground"> ETB {performance.currentStockValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-muted-foreground">
            Potential Retail: <span className="text-foreground font-medium"> ETB {performance.potentialRevenue.toLocaleString()}</span>
          </div>
        </div>

        {/* 3. Turnover Ratio */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Turnover Velocity</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {health.turnoverRate.toFixed(2)}x
          </div>
          <div className="text-[11px] text-muted-foreground">
            Stock-to-Sales Ratio: <span className="text-foreground font-medium">{health.stockToSalesRatio.toFixed(2)}</span>
          </div>
        </div>

        {/* 4. Actionable Alerts */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Actionable Alerts</span>
            <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {health.lowStockWarningCount + health.outOfStockCount}
          </div>
          <div className="text-[11px] text-destructive flex items-center gap-1.5">
            <span>{health.lowStockWarningCount} Low</span> &bull;
            <span>{health.outOfStockCount} Stockouts</span>
          </div>
        </div>
      </div>

      {/* Interactive Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Revenue vs Profit Over Time */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Revenue vs. Gross Profit Trend</h2>
              <p className="text-xs text-muted-foreground">Sales volume and net returns across the selected timeframe.</p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `ETB ${val}`} />
                <Tooltip
                  formatter={(val: any) => [`ETB ${Number(val).toFixed(2)}`]}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "0.5rem",
                    fontSize: "0.75rem",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "0.75rem", paddingTop: "0.5rem" }} />
                <Bar dataKey="revenue" fill="var(--color-primary)" radius={[4, 4, 0, 0]} name="Total Revenue" />
                <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} name="Gross Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Stock Potential & Valuation */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-sm">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Inventory Valuation &amp; Potential Revenue</h2>
            <p className="text-xs text-muted-foreground">Cost asset valuation vs. realizable retail potential.</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline}>
                <defs>
                  <linearGradient id="colorPotential" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `ETB ${val}`} />
                <Tooltip
                  formatter={(val: any) => [`ETB ${Number(val).toFixed(2)}`]}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "0.5rem",
                    fontSize: "0.75rem",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "0.75rem", paddingTop: "0.5rem" }} />
                <Area type="monotone" dataKey="potentialRevenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPotential)" name="Potential Retail Value" />
                <Area type="monotone" dataKey="stockValue" stroke="#10b981" fillOpacity={1} fill="url(#colorCost)" name="Cost Asset Value" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-6 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`pb-3 border-b-2 transition-colors ${activeTab === "overview"
                ? "border-primary text-foreground font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            Category Distribution &amp; Top Models
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("items")}
            className={`pb-3 border-b-2 transition-colors ${activeTab === "items"
                ? "border-primary text-foreground font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            Item-by-Item Performance ({itemPerformance.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("reorder")}
            className={`pb-3 border-b-2 transition-colors ${activeTab === "reorder"
                ? "border-primary text-foreground font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            Reorder Radar ({lowStockItems.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("defects")}
            className={`pb-3 border-b-2 transition-colors ${activeTab === "defects"
                ? "border-primary text-foreground font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            Defects &amp; Losses (${defectMetrics.totalLossValue.toFixed(2)})
          </button>
        </nav>
      </div>

      {/* TAB CONTENT 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-primary" />
                Top Performing Hardware Models
              </h2>
              <span className="text-xs text-muted-foreground">Ranked by units sold</span>
            </div>

            <div className="divide-y divide-border">
              {bestSellers.map((item, idx) => (
                <div key={item.productId} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-muted-foreground text-xs w-4">0{idx + 1}</span>
                    <div>
                      <p className="font-semibold text-foreground">{item.name}</p>
                      <span className="font-mono text-[10px] text-muted-foreground">{item.sku}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground"> ETB {item.revenue.toFixed(2)}</p>
                    <span className="text-[10px] text-muted-foreground">{item.quantity} units sold</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 flex flex-col justify-between shadow-sm">
            <h2 className="text-sm font-semibold text-foreground mb-2">Category Revenue Split</h2>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySales}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="revenue"
                    nameKey="categoryName"
                  >
                    {categorySales.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`ETB ${Number(value).toFixed(2)}`, "Revenue"]}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: "0.5rem",
                      fontSize: "0.75rem",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-border/50 text-[11px]">
              {categorySales.map((cat, idx) => (
                <div key={cat.categoryId} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                    />
                    <span className="text-muted-foreground truncate max-w-[120px]">{cat.categoryName}</span>
                  </div>
                  <span className="font-semibold text-foreground"> ETB {cat.revenue.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: ITEM-BY-ITEM PERFORMANCE */}
      {activeTab === "items" && (
        <div className="space-y-3">
          <div className="w-full sm:w-72 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Filter by product name or SKU..."
              value={itemSearch}
              onChange={(e) => setItemSearch(e.target.value)}
              className="pl-9 h-8 text-xs bg-card"
            />
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <table className="w-full text-xs text-left">
              <thead className="border-b border-border bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="p-3.5">Hardware Item</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5 text-center">Units Sold</th>
                  <th className="p-3.5">Total Revenue</th>
                  <th className="p-3.5">Gross Profit</th>
                  <th className="p-3.5">Margin %</th>
                  <th className="p-3.5 text-center">Stock</th>
                  <th className="p-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredItemPerformance.map((item) => (
                  <tr key={item.productId} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3.5">
                      <p className="font-medium text-foreground">{item.name}</p>
                      <span className="font-mono text-[10px] text-muted-foreground">{item.sku}</span>
                    </td>
                    <td className="p-3.5 text-muted-foreground">{item.categoryName}</td>
                    <td className="p-3.5 text-center font-semibold">{item.unitsSold}</td>
                    <td className="p-3.5 font-semibold text-foreground"> ETB {item.revenue.toFixed(2)}</td>
                    <td className="p-3.5 font-semibold text-emerald-500"> ETB {item.grossProfit.toFixed(2)}</td>
                    <td className="p-3.5 font-mono">{item.marginPercentage.toFixed(1)}%</td>
                    <td className="p-3.5 text-center font-bold">{item.currentStock}</td>
                    <td className="p-3.5 text-right">
                      <span
                        className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${item.status === "HEALTHY"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : item.status === "LOW_STOCK"
                              ? "bg-amber-500/10 text-amber-500"
                              : item.status === "OUT_OF_STOCK"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-muted text-muted-foreground"
                          }`}
                      >
                        {item.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: REORDER RADAR */}
      {activeTab === "reorder" && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
          <div>
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Low Stock &amp; Immediate Reorder List
            </h2>
            <p className="text-xs text-muted-foreground">
              Hardware units with less than 5 units remaining in inventory.
            </p>
          </div>

          <div className="divide-y divide-border">
            {lowStockItems.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">
                All inventory levels are healthy.
              </p>
            ) : (
              lowStockItems.map((item) => (
                <div key={item.id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-semibold text-foreground">{item.productName}</p>
                    <span className="font-mono text-[10px] text-muted-foreground">{item.sku}</span>
                  </div>
                  <span className="font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full text-xs">
                    {item.quantity} Remaining
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: DEFECTS & LOSSES */}
      {activeTab === "defects" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-border bg-card space-y-1.5">
            <span className="text-xs text-muted-foreground">Total Financial Shrinkage</span>
            <div className="text-2xl font-bold text-destructive">
              -${defectMetrics.totalLossValue.toFixed(2)}
            </div>
            <p className="text-[10px] text-muted-foreground">Cost basis of broken/lost inventory</p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card space-y-1.5">
            <span className="text-xs text-muted-foreground">Defective Units (DOA)</span>
            <div className="text-2xl font-bold text-foreground">
              {defectMetrics.defectCount}
            </div>
            <p className="text-[10px] text-muted-foreground">Units returned and written off</p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card space-y-1.5">
            <span className="text-xs text-muted-foreground">Adjustment Write-offs</span>
            <div className="text-2xl font-bold text-foreground">
              {defectMetrics.adjustmentLossCount}
            </div>
            <p className="text-[10px] text-muted-foreground">Inventory discrepancies &amp; audit losses</p>
          </div>
        </div>
      )}
    </div>
  );
}
