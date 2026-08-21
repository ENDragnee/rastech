"use client";

import Link from "next/link";
import { useDashboardAnalytics } from "@/features/analytics/hooks/use-dashboard-analytics";
import { useUsers } from "@/features/user/hooks/use-users";
import { useRoles } from "@/features/role/hooks/use-roles";
import { useLogs } from "@/features/log/hooks/use-logs";
import {
  DollarSign,
  Boxes,
  Users,
  ShieldCheck,
  TrendingUp,
  Activity,
  ArrowRight,
  PlusCircle,
  ShieldAlert,
  Loader2,
  AlertTriangle,
  Receipt,
  ShoppingCart,
  Tags,
  FileText,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
  // Queries
  const { data: analyticsData, isLoading: isLoadingAnalytics } = useDashboardAnalytics("MONTH");
  const { data: usersData, isLoading: isLoadingUsers } = useUsers({ limit: 5 });
  const { data: rolesData, isLoading: isLoadingRoles } = useRoles({ limit: 5 });
  const { data: logsData, isLoading: isLoadingLogs } = useLogs({ limit: 5, sort: "createdAt", order: "desc" });

  const isLoading = isLoadingAnalytics || isLoadingUsers || isLoadingRoles || isLoadingLogs;

  if (isLoading || !analyticsData) {
    return (
      <div className="h-[calc(100vh-8rem)] flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm font-medium">Loading system administration console...</p>
      </div>
    );
  }

  const { performance, health } = analyticsData;
  const totalStaffCount = usersData?.meta?.total || 0;
  const totalRolesCount = rolesData?.meta?.total || 0;
  const recentLogs = logsData?.data || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            System Administration &amp; Governance
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Enterprise overview of store financials, RBAC security profiles, staff allocation, and audit events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/users">
            <Button size="sm" className="text-xs gap-1.5 bg-primary text-primary-foreground font-semibold">
              <PlusCircle className="w-3.5 h-3.5" />
              Manage Staff Users
            </Button>
          </Link>
          <Link href="/cashier/pos">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 border-border hover:bg-muted">
              <ShoppingCart className="w-3.5 h-3.5" />
              Open POS
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Primary Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. Revenue & Gross Profit */}
        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Gross Realized Sales</span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground font-mono"> ETB {performance.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-500 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span> ETB {performance.grossProfit.toFixed(2)} Profit ({performance.grossMarginPercentage.toFixed(1)}% margin)</span>
          </div>
        </div>

        {/* 2. Warehouse Valuation */}
        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Total Warehouse Assets</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground font-mono"> ETB {performance.currentStockValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-muted-foreground">
            Potential Retail: <span className="text-foreground font-medium"> ETB {performance.potentialRevenue.toLocaleString()}</span>
          </div>
        </div>

        {/* 3. Staff & RBAC Profiles */}
        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Staff &amp; Access Roles</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">
            {totalStaffCount} <span className="text-sm font-normal text-muted-foreground">Users</span>
          </div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>{totalRolesCount} Configured Roles</span>
          </div>
        </div>

        {/* 4. Attention & Shrinkage */}
        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Inventory Alerts</span>
            <div className="p-2 rounded-xl bg-destructive/10 text-destructive">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">
            {health.lowStockWarningCount + health.outOfStockCount}
          </div>
          <div className="text-[11px] text-destructive flex items-center gap-1.5">
            <span>{health.lowStockWarningCount} Low</span> &bull;
            <span>{health.outOfStockCount} Stockouts</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Live Audit Stream + Quick Tool Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Management Shortcuts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              href="/admin/users"
              className="p-3.5 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all group"
            >
              <Users className="w-5 h-5 text-primary mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-xs text-foreground">User Accounts</p>
              <p className="text-[10px] text-muted-foreground">Staff credentials &amp; status</p>
            </Link>

            <Link
              href="/admin/roles"
              className="p-3.5 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all group"
            >
              <ShieldAlert className="w-5 h-5 text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-xs text-foreground">RBAC Roles</p>
              <p className="text-[10px] text-muted-foreground">Permission matrix</p>
            </Link>

            <Link
              href="/admin/categories"
              className="p-3.5 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all group"
            >
              <Tags className="w-5 h-5 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-xs text-foreground">Categories</p>
              <p className="text-[10px] text-muted-foreground">Store taxonomies</p>
            </Link>

            <Link
              href="/manager/dashboard"
              className="p-3.5 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all group"
            >
              <TrendingUp className="w-5 h-5 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-xs text-foreground">Analytics Hub</p>
              <p className="text-[10px] text-muted-foreground">Turnover &amp; margins</p>
            </Link>
          </div>

          {/* Live Activity & Audit Stream */}
          <div className="rounded-2xl border border-border bg-card shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold text-foreground">
                  Live System Activity &amp; Audit Trail
                </h2>
              </div>
              <Link
                href="/admin/logs"
                className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
              >
                View Complete Log Registry <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-border">
              {recentLogs.length === 0 ? (
                <p className="text-xs text-muted-foreground py-6 text-center">No recent audit events.</p>
              ) : (
                recentLogs.map((l) => (
                  <div key={l.id} className="py-3 flex items-center justify-between text-xs gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border uppercase ${l.severity === "INFO"
                            ? "bg-blue-500/10 text-blue-500 border-blue-500/30"
                            : l.severity === "WARNING"
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                              : "bg-destructive/10 text-destructive border-destructive/30"
                            }`}
                        >
                          {l.severity}
                        </span>
                        <span className="font-mono text-[11px] font-semibold text-foreground truncate">
                          {l.type}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-[11px] truncate max-w-md">
                        {l.message}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-[11px] text-primary block">
                        @{l.user?.userName || "system"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(l.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1/3): Governance Overview */}
        <div className="space-y-6">
          {/* Quick Access to POS & Transactions */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3.5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Front of House &amp; POS
            </h3>

            <div className="space-y-2">
              <Link
                href="/cashier/pos"
                className="flex items-center justify-between p-3 rounded-xl border border-border bg-background hover:border-primary/50 transition-all text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingCart className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-foreground">Launch POS Checkout</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>

              <Link
                href="/admin/transactions"
                className="flex items-center justify-between p-3 rounded-xl border border-border bg-background hover:border-primary/50 transition-all text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <Receipt className="w-4 h-4 text-emerald-500" />
                  <span className="font-semibold text-foreground">Audit Sales &amp; Invoices</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>

              <Link
                href="/manager/reports"
                className="flex items-center justify-between p-3 rounded-xl border border-border bg-background hover:border-primary/50 transition-all text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-purple-500" />
                  <span className="font-semibold text-foreground">Generate Tax &amp; Audit PDF</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </div>
          </div>

          {/* System Environment & Integrity Info */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-sm text-xs">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              System Status
            </h3>
            <div className="space-y-2 text-[11px] text-muted-foreground">
              <div className="flex justify-between py-1 border-b border-border/50">
                <span>Database Status</span>
                <span className="text-emerald-500 font-semibold">Healthy (PostgreSQL)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span>Session Policy</span>
                <span className="text-foreground font-mono">JWT Token (Active)</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Turnover Ratio</span>
                <span className="text-primary font-mono font-bold">{health.turnoverRate.toFixed(2)}x</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
