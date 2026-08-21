import React from "react";
import { Box } from "lucide-react";
import { ThemeDropdown } from "@/components/ui/theme-toggle";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-background p-4 sm:p-6 lg:p-8">
      {/* Top Bar */}
      <header className="w-full flex items-center justify-between max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
            <Box className="h-4 w-4" />
          </div>
          <span className="font-semibold tracking-tight text-foreground text-base">
            Rastech
          </span>
        </div>
        <ThemeDropdown />
      </header>

      {/* Center Auth Card */}
      <main className="w-full flex items-center justify-center py-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1.5 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-muted-foreground py-4">
        &copy; {new Date().getFullYear()} Rastech Electronics. Internal Systems.
      </footer>
    </div>
  );
}
