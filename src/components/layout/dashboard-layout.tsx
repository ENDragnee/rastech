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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeDropdown } from "@/components/ui/theme-toggle";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  permission?: string;
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

  // Safely normalize user role
  const primaryRole = Array.isArray(user.role)
    ? user.role[0]
    : user.role || "STAFF";
  const roleSlug = primaryRole.toLowerCase();

  // Generate User Initials
  const displayName = user.name || user.userName || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  // Navigation Items mapped to permissions
  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: `/${roleSlug}/dashboard`,
      icon: LayoutDashboard,
    },
    {
      title: "POS Checkout",
      href: `/${roleSlug}/pos`,
      icon: ShoppingCart,
      permission: "CREATE_TRANSACTION",
    },
    {
      title: "Transactions",
      href: `/${roleSlug}/transactions`,
      icon: Receipt,
      permission: "FETCH_TRANSACTION",
    },
    {
      title: "Products",
      href: `/${roleSlug}/products`,
      icon: Package,
      permission: "FETCH_PRODUCTS",
    },
    {
      title: "Stock & Serials",
      href: `/${roleSlug}/stock`,
      icon: Boxes,
      permission: "FETCH_STOCK",
    },
    {
      title: "Categories",
      href: "/admin/categories",
      icon: Tags,
      permission: "CREATE_CATEGORY",
    },
    {
      title: "Reports",
      href: `/${roleSlug}/reports`,
      icon: FileText,
      permission: "FETCH_REPORTS",
    },
    {
      title: "User Accounts",
      href: "/admin/users",
      icon: Users,
      permission: "FETCH_ALL_USERS",
    },
    {
      title: "Roles & Permissions",
      href: "/admin/roles",
      icon: ShieldAlert,
      permission: "FETCH_ROLE",
    },
    {
      title: "Audit Logs",
      href: "/admin/logs",
      icon: Activity,
      permission: "FETCH_LOGS",
    },
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (!item.permission) return true;
    return user.permissions?.includes(item.permission);
  });

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
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
                {primaryRole} Console
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

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Menu Navigation
          </div>
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-xs font-medium rounded-xl transition-all group",
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
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="capitalize font-semibold text-foreground">
                {roleSlug}
              </span>
              <span>/</span>
              <span className="capitalize">
                {pathname.split("/").filter(Boolean).slice(1).join(" / ") || "Dashboard"}
              </span>
            </div>
          </div>

          {/* Top Right User Avatar Trigger (YouTube Style) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2.5 p-1 rounded-full hover:ring-2 hover:ring-primary/40 transition-all"
            >
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-xs border border-primary/30 shadow-sm">
                {initials}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
              </div>
            </button>
          </div>
        </header>

        {/* Global YouTube-Style Profile Flyout Menu */}
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
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[9px] font-mono font-bold uppercase text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                      {primaryRole}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="py-2.5 space-y-1.5 text-xs text-muted-foreground border-b border-border">
                <div className="flex justify-between items-center px-1">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    Session Status
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
                <div className="flex justify-between items-center px-1">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    Permissions
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-foreground">
                    {user.permissions?.length || 0} Granted
                  </span>
                </div>
              </div>

              {/* YouTube-Style Theme / Appearance Selector */}
              <div className="py-3 border-b border-border space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-foreground px-1">
                  <SunMoon className="w-3.5 h-3.5 text-primary" />
                  <span>Appearance</span>
                </div>
                <div className="flex justify-center">
                  <ThemeDropdown />
                </div>
              </div>

              {/* Quick Links & Sign Out */}
              <div className="pt-2 space-y-1">
                {primaryRole === "MANAGER" && (
                  <Link
                    href="/manager/docs"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <BookOpen className="w-4 h-4 text-primary" />
                    Metrics Documentation
                  </Link>
                )}

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

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
