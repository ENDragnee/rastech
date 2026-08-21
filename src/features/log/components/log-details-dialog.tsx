"use client";

import { useState } from "react";
import { type LogItem } from "@/features/log/hooks/use-logs";
import {
  Activity,
  X,
  User,
  Calendar,
  Globe,
  Tag,
  Copy,
  Check,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LogDetailsDialogProps {
  log: LogItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function LogDetailsDialog({
  log,
  isOpen,
  onClose,
}: LogDetailsDialogProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !log) return null;

  const handleCopyJson = () => {
    if (!log.details) return;
    navigator.clipboard.writeText(JSON.stringify(log.details, null, 2));
    setCopied(true);
    toast.success("Payload copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/40">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Audit Event Inspector
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Top Severity & Type Bar */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-background">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-semibold">
                Event Type
              </span>
              <span className="font-mono font-bold text-foreground text-xs">
                {log.type}
              </span>
            </div>

            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase ${log.severity === "INFO"
                  ? "bg-blue-500/10 text-blue-500 border-blue-500/30"
                  : log.severity === "WARNING"
                    ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                    : log.severity === "ERROR"
                      ? "bg-destructive/10 text-destructive border-destructive/30"
                      : "bg-purple-500/15 text-purple-500 border-purple-500/40"
                }`}
            >
              {log.severity}
            </span>
          </div>

          {/* Message */}
          <div className="space-y-1 p-3 rounded-xl border border-border bg-muted/20">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Log Message
            </span>
            <p className="text-foreground leading-relaxed font-medium">
              {log.message}
            </p>
          </div>

          {/* Event Metadata Grid */}
          <div className="grid grid-cols-2 gap-2.5 border-b border-border pb-4 text-[11px]">
            <div className="space-y-0.5">
              <span className="text-muted-foreground flex items-center gap-1">
                <User className="w-3 h-3 text-primary" /> Actor / Staff
              </span>
              <p className="font-semibold text-foreground font-mono">
                {log.user ? `@${log.user.userName}` : "System Anonymous"}
              </p>
            </div>

            <div className="space-y-0.5">
              <span className="text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3 text-muted-foreground" /> Timestamp
              </span>
              <p className="font-mono text-foreground">
                {new Date(log.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="space-y-0.5">
              <span className="text-muted-foreground flex items-center gap-1">
                <Globe className="w-3 h-3 text-muted-foreground" /> IP Address
              </span>
              <p className="font-mono text-foreground">{log.ipAddress || "Internal / Local"}</p>
            </div>

            <div className="space-y-0.5">
              <span className="text-muted-foreground flex items-center gap-1">
                <Tag className="w-3 h-3 text-muted-foreground" /> Target Entity
              </span>
              <p className="font-medium text-foreground truncate">
                {log.targetName || log.targetId || "—"}
              </p>
            </div>
          </div>

          {/* JSON Payload Details (If present) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
                <Code2 className="w-3.5 h-3.5 text-primary" />
                Raw Payload &amp; Context
              </span>

              {log.details && (
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copy JSON
                    </>
                  )}
                </button>
              )}
            </div>

            {log.details && Object.keys(log.details).length > 0 ? (
              <pre className="p-3.5 rounded-xl border border-border bg-muted/40 font-mono text-[11px] overflow-x-auto max-h-48 text-foreground">
                {JSON.stringify(log.details, null, 2)}
              </pre>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-border text-center text-muted-foreground text-[11px]">
                No additional JSON payload stored with this event.
              </div>
            )}
          </div>
        </div>

        <div className="p-3 border-t border-border bg-muted/20 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
