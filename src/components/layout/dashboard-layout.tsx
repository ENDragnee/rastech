"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Box,
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  RotateCcw,
  Package,
  Boxes,
  Tags,
  Users,
  ShieldAlert,
  FileText,
  Activity,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Sparkles,
  BookOpen,
  SunMoon,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeDropdown } from "@/components/ui/theme-toggle";
import { Footer } from "@/components/layout/footer";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  show: boolean;
  badge?: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: {
    name?: string | null;
    userName?: string;
    role: string | string[];
    permissions?: string[];
  };
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);

  // 1. Normalize Roles and Permissions
  const userRoles: string[] = Array.isArray(user.role)
    ? user.role
    : [user.role || "STAFF"];

  const userPerms = user.permissions || [];
  const hasPerm = (perm: string) => userPerms.includes(perm);

  const isAdmin = userRoles.includes("ADMIN");
  const isManager = userRoles.includes("MANAGER");
  const isCashier = userRoles.includes("CASHIER");

  // User Avatar Initials
  const displayName = user.name || user.userName || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  // 2. Navigation Sections Matrix
  const navSections: NavSection[] = [
    // GROUP 1: WORKSPACES (Shows all authorized dashboards)
    {
      label: "Workspaces",
      items: [
        {
          title: "Admin Dashboard",
          href: "/admin/dashboard",
          icon: LayoutDashboard,
          show: isAdmin,
        },
        {
          title: "Manager Dashboard",
          href: "/manager/dashboard",
          icon: LayoutDashboard,
          show: isManager,
        },
        {
          title: "Cashier Dashboard",
          href: "/cashier/dashboard",
          icon: LayoutDashboard,
          show: isCashier && !isAdmin && !isManager,
        },
      ],
    },

    // GROUP 2: POINT OF SALE & REGISTRY
    {
      label: "Sales & POS",
      items: [
        {
          title: "POS Checkout",
          href: "/cashier/pos",
          icon: ShoppingCart,
          show: hasPerm("PROCESS_SALE") || hasPerm("CREATE_TRANSACTION") || isCashier || isManager || isAdmin,
        },
        {
          title: "Returns & Warranty Desk",
          href: "/cashier/returns",
          icon: RotateCcw,
          show: hasPerm("PROCESS_RETURN") || hasPerm("CREATE_TRANSACTION") || isCashier || isManager || isAdmin,
        },
        {
          title: isManager || isAdmin ? "Transactions & Invoices" : "Sales History",
          href: isManager || isAdmin ? "/manager/transactions" : "/cashier/transactions",
          icon: Receipt,
          show: hasPerm("FETCH_TRANSACTION"),
        },
      ],
    },

    // GROUP 3: INVENTORY & CATALOG
    {
      label: "Inventory & Catalog",
      items: [
        {
          title: "Products Catalog",
          href: isManager || isAdmin ? "/manager/products" : "/cashier/products",
          icon: Package,
          show: hasPerm("FETCH_PRODUCTS"),
        },
        {
          title: "Stock Batches & Serials",
          href: isManager || isAdmin ? "/manager/stock" : "/cashier/stock",
          icon: Boxes,
          show: hasPerm("FETCH_STOCK") || isManager || isAdmin,
        },
        {
          title: "Categories",
          href: "/admin/categories",
          icon: Tags,
          show: isAdmin, // Strictly ADMIN only
        },
      ],
    },

    // GROUP 4: EXECUTIVE REPORTS & FORMULAS (Manager & Admin)
    {
      label: "Executive Analytics",
      items: [
        {
          title: "Reports Generator",
          href: "/manager/reports",
          icon: FileText,
          show: hasPerm("FETCH_REPORTS") || isManager || isAdmin,
        },
        {
          title: "Metrics Guide & Sandbox",
          href: "/manager/docs",
          icon: BookOpen,
          show: hasPerm("VIEW_ANALYTICS") || isManager || isAdmin,
        },
      ],
    },

    // GROUP 5: SYSTEM GOVERNANCE (Admin Exclusive)
    {
      label: "System Administration",
      items: [
        {
          title: "Staff User Accounts",
          href: "/admin/users",
          icon: Users,
          show: isAdmin || hasPerm("FETCH_ALL_USERS"),
        },
        {
          title: "Roles & Permissions (RBAC)",
          href: "/admin/roles",
          icon: ShieldAlert,
          show: isAdmin || hasPerm("FETCH_ROLE"),
        },
        {
          title: "Audit & Security Logs",
          href: "/admin/logs",
          icon: Activity,
          show: isAdmin || hasPerm("FETCH_LOGS"),
        },
      ],
    },
  ];

  // Filter sections that have at least one authorized link
  const visibleSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.show),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-border bg-card transition-transform duration-300 md:static md:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-[0_0_15px_rgba(var(--primary),0.3)]">
              <Box className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-tight text-foreground tracking-tight">
                Rastech<span className="text-primary">.</span>
              </span>
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                {userRoles.join(" • ")}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8 text-muted-foreground"
            onClick={() => setIsMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Dynamic Section-Grouped Nav */}
        <nav className="flex-1 space-y-4 p-3 overflow-y-auto">
          {visibleSections.map((section) => (
            <div key={section.label} className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                {section.label}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-xl transition-all group",
                        isActive
                          ? "bg-primary text-primary-foreground font-semibold shadow-sm shadow-primary/20"
                          : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-sm flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8 text-muted-foreground"
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="font-bold text-foreground">Rastech</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              <span className="capitalize font-medium">
                {pathname.split("/").filter(Boolean).slice(0, 2).join(" / ") || "Dashboard"}
              </span>
            </div>
          </div>

          {/* Top Right Profile Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2.5 p-1 rounded-full hover:ring-2 hover:ring-primary/40 transition-all"
            >
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-xs border border-primary/30 shadow-sm">
                {initials}
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-background" />
              </div>
            </button>
          </div>
        </header>

        {/* User Flyout Menu */}
        {isUserMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-transparent"
              onClick={() => setIsUserMenuOpen(false)}
            />
            <div className="fixed top-16 right-4 sm:right-6 z-50 w-80 rounded-2xl border border-border bg-card p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              {/* Profile Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-border">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-sm border border-primary/30 shadow-sm">
                  {initials}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-foreground truncate">
                    {user.name || user.userName}
                  </span>
                  <span className="text-[11px] text-muted-foreground truncate font-mono">
                    @{user.userName}
                  </span>
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    {userRoles.map((r) => (
                      <span
                        key={r}
                        className="text-[9px] font-mono font-bold uppercase text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-full"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Workspace Switcher */}
              {userRoles.length > 1 && (
                <div className="py-2.5 border-b border-border space-y-1.5">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Available Workspaces
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {isAdmin && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center justify-between transition-colors ${pathname.startsWith("/admin")
                            ? "border-primary bg-primary/10 text-primary font-bold"
                            : "border-border text-muted-foreground hover:bg-muted"
                          }`}
                      >
                        <span>Admin Console</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </Link>
                    )}
                    {isManager && (
                      <Link
                        href="/manager/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center justify-between transition-colors ${pathname.startsWith("/manager")
                            ? "border-primary bg-primary/10 text-primary font-bold"
                            : "border-border text-muted-foreground hover:bg-muted"
                          }`}
                      >
                        <span>Manager Hub</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </Link>
                    )}
                    {isCashier && (
                      <Link
                        href="/cashier/pos"
                        onClick={() => setIsUserMenuOpen(false)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center justify-between transition-colors col-span-2 ${pathname.startsWith("/cashier")
                            ? "border-primary bg-primary/10 text-primary font-bold"
                            : "border-border text-muted-foreground hover:bg-muted"
                          }`}
                      >
                        <span>Cashier POS</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Status Section */}
              <div className="py-2 space-y-1 text-xs text-muted-foreground border-b border-border">
                <div className="flex justify-between items-center px-1">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    Account Status
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    Authenticated
                  </span>
                </div>
                <div className="flex justify-between items-center px-1">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    Permissions
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-foreground">
                    {userPerms.length} Active
                  </span>
                </div>
              </div>

              {/* Theme Selector */}
              <div className="py-2.5 border-b border-border space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-medium text-foreground px-1">
                  <SunMoon className="w-3.5 h-3.5 text-primary" />
                  <span>Appearance</span>
                </div>
                <div className="flex justify-center">
                  <ThemeDropdown />
                </div>
              </div>

              {/* Sign Out Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </>
        )}

        {/* Dynamic Page Content with Integrated Footer */}
        <main className="flex-1 flex flex-col justify-between overflow-y-auto">
          <div className="p-4 sm:p-6 flex-1">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
