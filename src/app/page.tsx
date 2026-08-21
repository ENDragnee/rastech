import Link from "next/link";
import { GetApiSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { ThemeDropdown } from "@/components/ui/theme-toggle";
import { Footer } from "@/components/layout/footer";
import {
  Box,
  ArrowRight,
  Package,
  Layers,
  FileSpreadsheet,
} from "lucide-react";

export default async function LandingPage() {
  const session = await GetApiSession();
  const user = session?.user;

  const userRoles = Array.isArray(user?.role) ? user.role : [user?.role || "STAFF"];

  const dashboardHref = userRoles.includes("ADMIN")
    ? "/admin/dashboard"
    : userRoles.includes("MANAGER")
      ? "/manager/dashboard"
      : "/cashier/dashboard";

  const primaryRoleLabel = userRoles[0] || "Staff";

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      {/* Header Navbar */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-background font-bold">
              <Box className="h-4 w-4" />
            </div>
            <span className="font-bold text-sm tracking-tight text-foreground">
              Rastech<span className="text-primary">.</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeDropdown />
            {session ? (
              <Link href={dashboardHref}>
                <Button size="sm" className="h-8 gap-1.5 text-xs font-medium bg-primary text-primary-foreground">
                  Dashboard <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            ) : (
              <Link href="/auth/signin">
                <Button size="sm" className="h-8 text-xs font-medium bg-primary text-primary-foreground">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto max-w-4xl px-4 py-16 sm:py-24 text-center my-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Internal Electronics Stock &amp; POS Portal
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground max-w-2xl mx-auto leading-tight">
          Computer &amp; Electronics Inventory Management
        </h1>

        <p className="mt-4 text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Centralized hardware tracking, unique serial number verification, point-of-sale operations, and role-based audit governance.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          {session ? (
            <Link href={dashboardHref}>
              <Button className="h-10 px-6 text-xs sm:text-sm font-semibold gap-2 bg-primary text-primary-foreground shadow-sm">
                Open {primaryRoleLabel} Dashboard <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <Link href="/auth/signin">
              <Button className="h-10 px-6 text-xs sm:text-sm font-semibold gap-2 bg-primary text-primary-foreground shadow-sm">
                Access System <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>

        {/* Minimal Feature Cards */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left">
          <div className="rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40">
            <div className="p-2 rounded-xl bg-primary/10 text-primary w-fit mb-3">
              <Package className="h-4 w-4" />
            </div>
            <h2 className="text-xs font-semibold text-foreground">Hardware &amp; Serial Tracking</h2>
            <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
              Unique tracking for laptops, cameras, RAM batches, and warranty periods.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 w-fit mb-3">
              <Layers className="h-4 w-4" />
            </div>
            <h2 className="text-xs font-semibold text-foreground">POS &amp; Transactions</h2>
            <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
              Direct checkout, thermal receipts, customer warranty registration, and returns.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 w-fit mb-3">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <h2 className="text-xs font-semibold text-foreground">Audit &amp; Security Logs</h2>
            <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
              Immutable activity trails of user authentications, stock modifications, and sales.
            </p>
          </div>
        </div>
      </main>

      {/* Integrated Credit Footer */}
      <Footer />
    </div>
  );
}
