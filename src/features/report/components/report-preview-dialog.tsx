"use client";

import { useRef } from "react";
import {
  FileText,
  Printer,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReportPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: any;
  title: string;
}

export function ReportPreviewDialog({
  isOpen,
  onClose,
  reportData,
  title,
}: ReportPreviewDialogProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !reportData) return null;

  const handlePrint = () => {
    window.print();
  };

  const { summary = {}, rows = [] } = reportData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/40 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Formal Document Preview
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handlePrint} className="h-8 text-xs gap-1.5 bg-primary">
              <Printer className="w-3.5 h-3.5" />
              Print / Save as PDF
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Formal Document Area */}
        <div ref={printRef} className="p-6 sm:p-10 overflow-y-auto space-y-6 text-xs text-foreground bg-card">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-border pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                  R
                </div>
                <h1 className="text-xl font-bold tracking-tight">RASTECH ELECTRONICS</h1>
              </div>
              <p className="text-muted-foreground text-[11px]">
                Computer &amp; Hardware Import &bull; Enterprise Solutions
              </p>
              <p className="text-muted-foreground text-[10px]">
                Audit &amp; Managerial Statement
              </p>
            </div>

            <div className="text-right space-y-1">
              <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                Official Report
              </span>
              <p className="font-semibold text-xs text-foreground mt-1">{title}</p>
              <p className="text-muted-foreground text-[10px]">
                Generated: {new Date().toLocaleString()}
              </p>
            </div>
          </div>

          {/* Executive Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(summary).map(([key, val]) => (
              <div key={key} className="p-3 rounded-xl border border-border bg-muted/20">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block capitalize">
                  {key.replace(/([A-Z])/g, " $1")}
                </span>
                <span className="text-base font-bold text-foreground font-mono">
                  {typeof val === "number" && key.toLowerCase().includes("value") || key.toLowerCase().includes("revenue") || key.toLowerCase().includes("profit") || key.toLowerCase().includes("cost") || key.toLowerCase().includes("liability")
                    ? `ETB ${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : typeof val === "number" && key.includes("Percent")
                      ? `${Number(val).toFixed(1)}%`
                      : String(val)}
                </span>
              </div>
            ))}
          </div>

          {/* Data Table */}
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-[11px] text-left">
              <thead className="bg-muted/50 text-muted-foreground border-b border-border uppercase font-semibold text-[9px]">
                <tr>
                  {rows.length > 0 &&
                    Object.keys(rows[0]).slice(0, 7).map((header) => (
                      <th key={header} className="p-2.5 capitalize">
                        {header.replace(/([A-Z])/g, " $1")}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono">
                {rows.slice(0, 100).map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-muted/20">
                    {Object.values(row).slice(0, 7).map((val: any, idx) => (
                      <td key={idx} className="p-2.5 truncate max-w-[160px]">
                        {typeof val === "boolean"
                          ? val ? "VAT (15%)" : "Exempt"
                          : typeof val === "number" && String(val).includes(".")
                            ? `ETB ${Number(val).toFixed(2)}`
                            : typeof val === "string" && val.includes("T") && val.includes("Z")
                              ? new Date(val).toLocaleDateString()
                              : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rows.length > 100 && (
            <p className="text-[10px] text-muted-foreground text-center italic">
              Showing first 100 of {rows.length} total records on this printable view. (Export CSV for full dataset)
            </p>
          )}

          {/* Signature & Audit Block */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-dashed border-border">
            <div className="space-y-4">
              <p className="text-[10px] text-muted-foreground font-semibold">PREPARED BY (MANAGER):</p>
              <div className="border-b border-border w-48 h-8" />
              <p className="text-[10px] text-muted-foreground">Signature &amp; Stamp</p>
            </div>
            <div className="space-y-4 text-right">
              <p className="text-[10px] text-muted-foreground font-semibold">VERIFIED &amp; AUDITED BY:</p>
              <div className="border-b border-border w-48 h-8 ml-auto" />
              <p className="text-[10px] text-muted-foreground">Internal Systems Auditor</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
