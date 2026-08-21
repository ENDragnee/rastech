import React from "react";
import Link from "next/link";
import { Box } from "lucide-react";
import { ThemeDropdown } from "@/components/ui/theme-toggle";
import { Footer } from "@/components/layout/footer";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-background">
      {/* Top Bar */}
      <header className="w-full border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-background font-bold">
              <Box className="h-4 w-4" />
            </div>
            <span className="font-bold text-sm tracking-tight text-foreground">
              Rastech<span className="text-primary">.</span>
            </span>
          </Link>

          <ThemeDropdown />
        </div>
      </header>

      {/* Center Form Card */}
      <main className="w-full flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-sm space-y-5 animate-in fade-in duration-300">
          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            {children}
          </div>
        </div>
      </main>

      {/* Integrated Credit Footer */}
      <Footer />
    </div>
  );
}
