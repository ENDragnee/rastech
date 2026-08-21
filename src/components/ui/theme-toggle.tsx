"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";

export function ThemeDropdown() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-8 w-28 bg-muted/60 animate-pulse rounded-lg" />
    );
  }

  return (
    <div className="flex items-center gap-1 bg-muted/80 p-1 rounded-xl border border-border">
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${theme === "light"
            ? "bg-card text-foreground shadow-sm font-semibold"
            : "text-muted-foreground hover:text-foreground"
          }`}
        title="Light theme"
      >
        <Sun className="w-3.5 h-3.5" />
        <span>Light</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${theme === "dark"
            ? "bg-card text-foreground shadow-sm font-semibold"
            : "text-muted-foreground hover:text-foreground"
          }`}
        title="Dark theme"
      >
        <Moon className="w-3.5 h-3.5" />
        <span>Dark</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme("system")}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${theme === "system"
            ? "bg-card text-foreground shadow-sm font-semibold"
            : "text-muted-foreground hover:text-foreground"
          }`}
        title="System default"
      >
        <Monitor className="w-3.5 h-3.5" />
        <span>Auto</span>
      </button>
    </div>
  );
}
