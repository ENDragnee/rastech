import Link from "next/link";
import { GetApiSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
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

  // Resolve target dashboard dynamically based on role
  const dashboardHref =
    user?.role.includes("ADMIN")
      ? "/admin/dashboard"
      : user?.role.includes("MANAGER")
        ? "/manager/dashboard"
        : "/cashier/dashboard";

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background">
              <Box className="h-4 w-4" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-foreground">
              Rastech Inventory
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {session ? (
              <Link href={dashboardHref}>
                <Button size="sm" className="h-8 gap-1.5 text-xs font-medium">
                  Dashboard <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            ) : (
              <Link href="/auth/signin">
                <Button size="sm" className="h-8 text-xs font-medium">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-4xl px-4 py-16 sm:py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Internal Management System
        </div>

        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-foreground max-w-2xl mx-auto leading-tight">
          Computer & Electronics Stock Management
        </h1>

        <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
          Centralized inventory tracking, serial number registration, POS operations, and role-based operational logs.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          {session ? (
            <Link href={dashboardHref}>
              <Button className="h-10 px-6 text-sm font-medium gap-2">
                Open Dashboard ({user?.role || "Staff"}) <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Link href="/auth/signin">
              <Button className="h-10 px-6 text-sm font-medium gap-2">
                Access System <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>

        {/* Minimal Feature Cards */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/20">
            <Package className="h-5 w-5 text-muted-foreground mb-3" />
            <h2 className="text-sm font-medium text-foreground">Hardware & Serial Tracking</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Unique tracking for laptops, cameras, RAM, and warranty periods.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/20">
            <Layers className="h-5 w-5 text-muted-foreground mb-3" />
            <h2 className="text-sm font-medium text-foreground">POS & Transactions</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Direct checkout, invoice generation, returns, and stock deductions.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/20">
            <FileSpreadsheet className="h-5 w-5 text-muted-foreground mb-3" />
            <h2 className="text-sm font-medium text-foreground">Audit & Activity Logs</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Full traceability of user modifications, stock entries, and sales history.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Rastech Electronics Inventory System &bull; Internal Portal
      </footer>
    </div>
  );
}
