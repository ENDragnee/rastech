import Link from "next/link";
import { Send, Phone, Code2 } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border/40 py-4 px-4 sm:px-6 bg-card/30 text-xs text-muted-foreground">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* System Copyright */}
        <div className="flex items-center gap-1.5 text-[11px] text-center sm:text-left">
          <span>&copy; {currentYear}</span>
          <span className="font-semibold text-foreground">Rastech Electronics</span>
          <span>&bull; All rights reserved.</span>
        </div>

        {/* Developer Credit & Contacts */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-primary" />
            <span>Developed by</span>
            <span className="font-bold text-foreground">Mastwal Mesfin</span>
          </span>

          <span className="text-border hidden sm:inline">&bull;</span>

          {/* Telegram Link */}
          <a
            href="https://t.me/MastwalMesfin"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-primary hover:underline transition-colors font-medium"
            title="Connect on Telegram"
          >
            <Send className="w-3 h-3" />
            <span>Telegram</span>
          </a>

          <span className="text-border hidden sm:inline">&bull;</span>

          {/* Phone Call Link */}
          <a
            href="tel:0915949551"
            className="flex items-center gap-1 text-emerald-500 hover:underline transition-colors font-mono font-semibold"
            title="Call Developer"
          >
            <Phone className="w-3 h-3" />
            <span>0915949551</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
