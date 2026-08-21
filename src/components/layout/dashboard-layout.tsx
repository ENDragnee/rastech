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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

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
    role: string;
    permissions?: string[];
  };
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  // Define navigation items mapped to permissions
  const navItems: NavItem[] = [
    // Common Dashboard
    {
      title: "Dashboard",
      href: `/${user.role.toLowerCase()}/dashboard`,
      icon: LayoutDashboard,
    },
    // Cashier & Admin POS
    {
      title: "POS Checkout",
      href: `/${user.role.toLowerCase()}/pos`,
      icon: ShoppingCart,
      permission: "CREATE_TRANSACTION",
    },
    {
      title: "Transactions",
      href: `/${user.role.toLowerCase()}/transactions`,
      icon: Receipt,
      permission: "FETCH_TRANSACTION",
    },
    // Manager & Admin Inventory
    {
      title: "Products",
      href: `/${user.role.toLowerCase()}/products`,
      icon: Package,
      permission: "FETCH_PRODUCTS",
    },
    {
      title: "Stock & Serials",
      href: `/${user.role.toLowerCase()}/stock`,
      icon: Boxes,
      permission: "FETCH_STOCK",
    },
    {
      title: "Categories",
      href: "/admin/categories",
      icon: Tags,
      permission: "CREATE_CATEGORY",
    },
    // Reports & Analytics
    {
      title: "Reports",
      href: `/${user.role.toLowerCase()}/reports`,
      icon: FileText,
      permission: "FETCH_REPORTS",
    },
    // Admin RBAC & Audit
    {
      title: "Users",
      href: "/admin/users",
      icon: Users,
      permission: "FETCH_ALL_USERS",
    },
    {
      title: "Roles & Access",
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

  // Filter navigation items by user permissions
  const filteredNavItems = navItems.filter((item) => {
    if (!item.permission) return true;
    return user.permissions?.includes(item.permission);
  });

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card">
        {/* Brand */}
        <div className="h-14 flex items-center gap-2.5 px-6 border-b border-border">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background">
            <Box className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm leading-tight text-foreground">
              Rastech
            </span>
            <span className="text-[10px] text-muted-foreground tracking-wider uppercase">
              {user.role} Portal
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <div className="flex flex-col truncate pr-2">
            <span className="text-xs font-medium text-foreground truncate">
              {user.name || user.userName}
            </span>
            <span className="text-[10px] text-muted-foreground truncate">
              @{user.userName}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-14 border-b border-border bg-background/80 backdrop-blur-sm flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium text-muted-foreground capitalize">
              {pathname.split("/").filter(Boolean).join(" / ")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
