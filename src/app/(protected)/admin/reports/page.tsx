"use client";

import { useState } from "react";
import { FileText, Calendar, Download, RefreshCw } from "lucide-react";

export default function ReportsPage() {
  const [reportType, setReportType] = useState("STOCK_STATUS");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert("Report successfully generated and downloaded!");
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Report Generator</h1>
          <p className="text-muted-foreground mt-1">Export high-level PDF and CSV reports for managerial review.</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/20">
          <h2 className="text-lg font-bold text-foreground">Configure Report Parameters</h2>
        </div>
        
        <div className="p-6 space-y-8">
          {/* Report Type */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground">Select Report Type</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => setReportType("STOCK_STATUS")}
                className={`flex flex-col items-start p-4 rounded-xl border ${reportType === "STOCK_STATUS" ? "border-primary bg-primary/10" : "border-border bg-background hover:bg-muted"} transition-all text-left`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <FileText className={`h-5 w-5 ${reportType === "STOCK_STATUS" ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`font-bold ${reportType === "STOCK_STATUS" ? "text-primary" : "text-foreground"}`}>Stock Status</span>
                </div>
                <p className="text-xs text-muted-foreground">Comprehensive snapshot of all current inventory levels and valuations.</p>
              </button>
              
              <button 
                onClick={() => setReportType("SALES_SUMMARY")}
                className={`flex flex-col items-start p-4 rounded-xl border ${reportType === "SALES_SUMMARY" ? "border-emerald-500 bg-emerald-500/10" : "border-border bg-background hover:bg-muted"} transition-all text-left`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <FileText className={`h-5 w-5 ${reportType === "SALES_SUMMARY" ? "text-emerald-500" : "text-muted-foreground"}`} />
                  <span className={`font-bold ${reportType === "SALES_SUMMARY" ? "text-emerald-500" : "text-foreground"}`}>Sales Summary</span>
                </div>
                <p className="text-xs text-muted-foreground">Aggregated sales revenue, net profit, and transaction volumes.</p>
              </button>

              <button 
                onClick={() => setReportType("DEFECTS")}
                className={`flex flex-col items-start p-4 rounded-xl border ${reportType === "DEFECTS" ? "border-rose-500 bg-rose-500/10" : "border-border bg-background hover:bg-muted"} transition-all text-left`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <FileText className={`h-5 w-5 ${reportType === "DEFECTS" ? "text-rose-500" : "text-muted-foreground"}`} />
                  <span className={`font-bold ${reportType === "DEFECTS" ? "text-rose-500" : "text-foreground"}`}>Defects & Losses</span>
                </div>
                <p className="text-xs text-muted-foreground">Trace all defective returns and calculate total associated revenue loss.</p>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Range */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" /> Date Range
              </label>
              <div className="flex items-center gap-2">
                <input 
                  type="date" 
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary text-muted-foreground"
                />
                <span className="text-muted-foreground">to</span>
                <input 
                  type="date" 
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary text-muted-foreground"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">Filter by Category (Optional)</label>
              <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground">
                <option value="">All Categories</option>
                <option value="LAPTOP_COMPUTER">Laptops</option>
                <option value="COMPUTER_ACCESSORIES">Accessories</option>
                <option value="DESKTOP_AND_PRINTER">Desktops & Printers</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border bg-muted/10 flex justify-end gap-4">
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="inline-flex items-center justify-center rounded-md border border-border bg-background px-6 py-2.5 text-sm font-medium shadow-sm hover:bg-muted transition-colors disabled:opacity-50"
          >
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </button>
          
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 min-w-[180px]"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" /> Generate PDF Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
