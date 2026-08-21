"use client";

import { useState } from "react";
import { useCategories } from "@/features/category/hooks/use-categories";
import { useReportData } from "@/features/report/hooks/use-reports";
import { ReportType } from "@/features/report/schemas/report.schema";
import { ReportPreviewDialog } from "@/features/report/components/report-preview-dialog";
import {
  FileText,
  Calendar,
  Download,
  Boxes,
  TrendingUp,
  AlertTriangle,
  Receipt,
  ShieldCheck,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("STOCK_STATUS");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categoryId, setCategoryId] = useState("ALL");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { data: categories = [] } = useCategories();
  const { data: reportResult, isFetching } = useReportData(
    {
      type: reportType,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      categoryId: categoryId !== "ALL" ? categoryId : undefined,
    },
    true
  );

  const reportCards = [
    {
      type: "STOCK_STATUS" as ReportType,
      title: "Stock Valuation & Status",
      icon: Boxes,
      color: "text-primary border-primary bg-primary/10",
      desc: "Complete warehouse snapshot with serial numbers, batch codes, cost basis, and total potential retail value.",
    },
    {
      type: "SALES_SUMMARY" as ReportType,
      title: "Sales & Profit Summary",
      icon: TrendingUp,
      color: "text-emerald-500 border-emerald-500 bg-emerald-500/10",
      desc: "Itemized retail revenues, wholesale cost of goods (COGS), gross profit margins, and responsible staff.",
    },
    {
      type: "DEFECTS_LOSSES" as ReportType,
      title: "Defects, Returns & Loss",
      icon: AlertTriangle,
      color: "text-destructive border-destructive bg-destructive/10",
      desc: "Audit trail of hardware returns, dead-on-arrival (DOA) units, and inventory shrinkage write-offs.",
    },
    {
      type: "TAX_VAT" as ReportType,
      title: "Tax & VAT Ledger (15%)",
      icon: Receipt,
      color: "text-blue-500 border-blue-500 bg-blue-500/10",
      desc: "Separate VAT-inclusive from exempt sales and calculate net taxable basis and total government tax liability.",
    },
    {
      type: "WARRANTY_RMA" as ReportType,
      title: "Warranty & RMA Coverage",
      icon: ShieldCheck,
      color: "text-purple-500 border-purple-500 bg-purple-500/10",
      desc: "Track serialized devices with active warranties, expiring terms, and registered customer contact numbers.",
    },
  ];

  // CSV Exporter with Excel UTF-8 BOM
  const handleExportCSV = () => {
    if (!reportResult?.rows || reportResult.rows.length === 0) {
      toast.error("No data available to export for this configuration.");
      return;
    }

    const rows = reportResult.rows;
    const headers = Object.keys(rows[0]);

    const csvRows = rows.map((row: any) =>
      headers
        .map((header) => {
          let val = row[header];
          if (val === null || val === undefined) val = "";
          if (typeof val === "boolean") val = val ? "VAT (15%)" : "Exempt";
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(",")
    );

    const csvString = "\uFEFF" + [headers.join(","), ...csvRows].join("\r\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Rastech_${reportType}_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV spreadsheet exported successfully");
  };

  const selectedTitle = reportCards.find((c) => c.type === reportType)?.title || "Report";

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2 animate-in fade-in duration-300">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Executive Report Generator
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Generate formal audit statements, printable executive PDFs, and Excel-compatible CSV exports.
        </p>
      </div>

      {/* Main Configuration Card */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-border bg-muted/20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">1. Select Report Category</h2>
          </div>
          {isFetching && (
            <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              Computing preview...
            </span>
          )}
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Report Type Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {reportCards.map((c) => {
              const Icon = c.icon;
              const isSelected = reportType === c.type;

              return (
                <button
                  key={c.type}
                  type="button"
                  onClick={() => setReportType(c.type)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${isSelected
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-background hover:bg-muted/60"
                    }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg border ${isSelected ? c.color : "bg-muted text-muted-foreground"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`font-bold text-xs ${isSelected ? "text-primary" : "text-foreground"}`}>
                        {c.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">
                      {c.desc}
                    </p>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-bold text-primary mt-3 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Selected Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Filter Parameters */}
          <div className="pt-2 border-t border-border space-y-3">
            <h3 className="text-xs font-bold text-foreground">2. Filter Parameters (Optional)</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* Date Range Start */}
              <div className="space-y-1.5">
                <label className="font-medium text-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  From Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Date Range End */}
              <div className="space-y-1.5">
                <label className="font-medium text-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  To Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Category Filter */}
              <div className="space-y-1.5">
                <label className="font-medium text-foreground">Hardware Department</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="ALL">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quick Metrics Summary Banner */}
          {reportResult?.summary && (
            <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Live Data Overview ({reportResult.rows?.length || 0} Records ready)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {Object.entries(reportResult.summary).slice(0, 4).map(([k, v]) => (
                  <div key={k}>
                    <span className="text-muted-foreground block text-[10px] capitalize">
                      {k.replace(/([A-Z])/g, " $1")}
                    </span>
                    <span className="font-bold text-foreground font-mono">
                      {typeof v === "number" && (k.toLowerCase().includes("value") || k.toLowerCase().includes("revenue") || k.toLowerCase().includes("profit") || k.toLowerCase().includes("cost"))
                        ? `ETB ${Number(v).toFixed(2)}`
                        : typeof v === "number" && k.includes("Percent")
                          ? `${Number(v).toFixed(1)}%`
                          : String(v)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 sm:p-5 border-t border-border bg-muted/10 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={handleExportCSV}
            disabled={isFetching || !reportResult?.rows?.length}
            className="text-xs h-10 gap-1.5 font-medium border-border hover:bg-muted"
          >
            <Download className="w-4 h-4" /> Export Excel CSV
          </Button>

          <Button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            disabled={isFetching || !reportResult?.rows?.length}
            className="text-xs h-10 gap-1.5 bg-primary text-primary-foreground font-semibold shadow-md min-w-[200px]"
          >
            <FileText className="w-4 h-4" /> View &amp; Print PDF Statement
          </Button>
        </div>
      </div>

      {/* Printable PDF Preview Modal */}
      <ReportPreviewDialog
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        reportData={reportResult}
        title={selectedTitle}
      />
    </div>
  );
}
