"use client";

import { useState } from "react";
import {
  useTransactions,
  type TransactionItem,
} from "@/features/transaction/hooks/use-transactions";
import {
  Search,
  Loader2,
  ReceiptText,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  CreditCard,
  Banknote,
  Landmark,
  PlusCircle,
  TrendingDown,
  TrendingUp,
  RotateCcw,
  Eye,
  Download,
  Copy,
  Printer,
  Calendar,
  Layers,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ManagerAdjustmentDialog } from "@/features/transaction/components/manager-adjustment-dialog";
import { TransactionDetailsDialog } from "@/features/transaction/components/transaction-details-dialog";
import { ReturnDialog } from "@/features/transaction/components/return-dialog";
import { PosReceiptDialog } from "@/features/pos/components/pos-receipt-dialog";
import { toast } from "sonner";

export default function ManagerTransactionsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [paymentFilter, setPaymentFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<"ALL" | "TODAY" | "WEEK" | "MONTH">("ALL");
  const [page, setPage] = useState(1);
  const [copiedInvoice, setCopiedInvoice] = useState<string | null>(null);

  // Modal States
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);
  const [returnItem, setReturnItem] = useState<TransactionItem | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  const { data, isLoading, isFetching } = useTransactions(search, page);

  const transactions = data?.data || [];
  const meta = data?.meta || { totalPages: 1, total: 0, page: 1 };

  // Filter in memory across all criteria
  const filteredTransactions = transactions.filter((tx) => {
    // 1. Type filter
    if (typeFilter !== "ALL" && tx.type !== typeFilter) return false;

    // 2. Payment Method filter
    if (paymentFilter !== "ALL" && tx.paymentMethod !== paymentFilter) return false;

    // 3. Date Range filter
    if (dateFilter !== "ALL") {
      const txDate = new Date(tx.createdAt);
      const now = new Date();
      if (dateFilter === "TODAY") {
        if (txDate.toDateString() !== now.toDateString()) return false;
      } else if (dateFilter === "WEEK") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (txDate < weekAgo) return false;
      } else if (dateFilter === "MONTH") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (txDate < monthAgo) return false;
      }
    }

    return true;
  });

  // Dynamic Financial Metrics
  const salesItems = filteredTransactions.filter((tx) => tx.type === "SOLD");
  const totalSalesVolume = salesItems.reduce((sum, tx) => sum + tx.price, 0);
  const averageOrderValue = salesItems.length > 0 ? totalSalesVolume / salesItems.length : 0;

  const totalLossVolume = filteredTransactions
    .filter((tx) => tx.type === "DEFECTIVE" || tx.type === "ADJUSTMENT_LOSS")
    .reduce((sum, tx) => sum + tx.price, 0);

  // Copy Invoice to Clipboard
  const handleCopyInvoice = (invoice: string) => {
    navigator.clipboard.writeText(invoice);
    setCopiedInvoice(invoice);
    toast.success(`Copied "${invoice}" to clipboard`);
    setTimeout(() => setCopiedInvoice(null), 2000);
  };

  // Export Filtered Records to CSV
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      toast.error("No records available to export");
      return;
    }

    const headers = [
      "Invoice Number",
      "Date",
      "Type",
      "Product Name",
      "SKU",
      "Serial Number",
      "Quantity",
      "Total Price",
      "Payment Method",
      "Customer Name",
      "Customer Phone",
      "Processed By",
    ];

    const rows = filteredTransactions.map((tx) => [
      `"${tx.invoiceNumber}"`,
      `"${new Date(tx.createdAt).toISOString()}"`,
      `"${tx.type}"`,
      `"${tx.stocks?.products?.name || "N/A"}"`,
      `"${tx.stocks?.products?.sku || "N/A"}"`,
      `"${tx.stocks?.serialNumber || "N/A"}"`,
      tx.quantity,
      tx.price.toFixed(2),
      `"${tx.paymentMethod || "N/A"}"`,
      `"${tx.customerName || "Walk-in"}"`,
      `"${tx.customerPhone || "N/A"}"`,
      `"${tx.users?.userName || "System"}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Rastech_Transactions_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Transaction audit log exported to CSV");
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Top Header & Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Transaction Registry &amp; Inventory Adjustments
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit store sales, customer warranty returns, and execute manual stock adjustments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs gap-1.5 border-border hover:bg-muted"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>

          <Button
            size="sm"
            onClick={() => setIsAdjustmentOpen(true)}
            className="text-xs gap-1.5 bg-primary text-primary-foreground font-semibold shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Record Stock Adjustment
          </Button>
        </div>
      </div>

      {/* Real-Time Financial Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Filtered Sales Volume</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            ${totalSalesVolume.toFixed(2)}
          </div>
          <span className="text-[10px] text-muted-foreground">
            From {salesItems.length} completed sales
          </span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Average Order Value (AOV)</span>
            <Layers className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            ${averageOrderValue.toFixed(2)}
          </div>
          <span className="text-[10px] text-muted-foreground">Per retail transaction</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Recorded Losses &amp; Shrinkage</span>
            <TrendingDown className="w-4 h-4 text-destructive" />
          </div>
          <div className="text-2xl font-bold text-destructive">
            -${totalLossVolume.toFixed(2)}
          </div>
          <span className="text-[10px] text-muted-foreground">Defective &amp; inventory write-offs</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Audit Trail Records</span>
            <ReceiptText className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">{meta.total}</div>
          <span className="text-[10px] text-muted-foreground">Database entries</span>
        </div>
      </div>

      {/* Search & Multi-Filter Control Strip */}
      <div className="space-y-3 bg-card p-4 rounded-xl border border-border">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
          {/* Status Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full text-xs scrollbar-none">
            {["ALL", "SOLD", "RETURNED", "DEFECTIVE", "ADJUSTMENT_LOSS", "PURCHASED"].map(
              (type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setTypeFilter(type);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${typeFilter === type
                      ? "bg-foreground text-background font-semibold"
                      : "bg-muted/60 text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {type.replace("_", " ")}
                </button>
              )
            )}
          </div>

          {/* Search Bar */}
          <div className="w-full lg:w-80 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search invoice, customer, SKU, SN..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-9 text-xs bg-background"
            />
          </div>
        </div>

        {/* Secondary Filters: Date Range & Payment Method */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/50 text-xs">
          {/* Date Range Selector */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground font-medium mr-1">Timeframe:</span>
            {(["ALL", "TODAY", "WEEK", "MONTH"] as const).map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setDateFilter(period)}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${dateFilter === period
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
              >
                {period === "ALL"
                  ? "All Time"
                  : period === "TODAY"
                    ? "Today"
                    : period === "WEEK"
                      ? "Last 7 Days"
                      : "Last 30 Days"}
              </button>
            ))}
          </div>

          {/* Payment Method Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground font-medium">Payment:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="h-7 rounded-lg border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Methods</option>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="TRANSFER">Transfer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <table className="w-full text-xs text-left">
          <thead className="border-b border-border bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
            <tr>
              <th className="p-3.5">Invoice</th>
              <th className="p-3.5">Date &amp; Time</th>
              <th className="p-3.5">Hardware / Item</th>
              <th className="p-3.5">Customer &amp; Warranty</th>
              <th className="p-3.5">Payment</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Total Value</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="p-10 text-center text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                  Loading transactions...
                </td>
              </tr>
            ) : filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-10 text-center text-muted-foreground">
                  <ReceiptText className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  No transaction records found matching your filters.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const isWarrantyValid =
                  tx.warrantyEndsAt && new Date(tx.warrantyEndsAt) > new Date();

                return (
                  <tr key={tx.id} className="hover:bg-muted/30 transition-colors group">
                    {/* Invoice ID with quick copy button */}
                    <td className="p-3.5 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-foreground">
                          {tx.invoiceNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyInvoice(tx.invoiceNumber)}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity"
                          title="Copy invoice #"
                        >
                          {copiedInvoice === tx.invoiceNumber ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <span className="text-[10px] text-muted-foreground block font-sans">
                        By @{tx.users?.userName || "system"}
                      </span>
                    </td>

                    {/* Date & Time */}
                    <td className="p-3.5 text-muted-foreground whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleDateString()}{" "}
                      <span className="text-[10px] opacity-70">
                        {new Date(tx.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>

                    {/* Hardware Item & Serial */}
                    <td className="p-3.5 max-w-xs">
                      <div className="font-medium text-foreground line-clamp-1">
                        {tx.stocks?.products?.name || "Hardware Item"}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1 rounded">
                          {tx.stocks?.products?.sku || "—"}
                        </span>
                        {tx.stocks?.serialNumber && (
                          <span className="font-mono text-[10px] text-primary bg-primary/10 px-1 rounded">
                            SN: {tx.stocks.serialNumber}
                          </span>
                        )}
                        {tx.stocks?.batchNumber && (
                          <span className="font-mono text-[10px] text-muted-foreground">
                            Lot: {tx.stocks.batchNumber}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Customer & Warranty Info */}
                    <td className="p-3.5">
                      <div className="font-medium text-foreground">
                        {tx.customerName || "Walk-in Customer"}
                      </div>
                      <div className="text-[10px] flex items-center gap-1 mt-0.5">
                        {tx.warrantyEndsAt ? (
                          isWarrantyValid ? (
                            <span className="text-emerald-500 flex items-center gap-0.5 font-medium">
                              <ShieldCheck className="w-3 h-3" />
                              Warranty Active
                            </span>
                          ) : (
                            <span className="text-muted-foreground flex items-center gap-0.5">
                              <ShieldAlert className="w-3 h-3 text-destructive" />
                              Warranty Expired
                            </span>
                          )
                        ) : (
                          <span className="text-muted-foreground">No Warranty</span>
                        )}
                      </div>
                    </td>

                    {/* Payment Method */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        {tx.paymentMethod === "CARD" ? (
                          <CreditCard className="w-3.5 h-3.5" />
                        ) : tx.paymentMethod === "TRANSFER" ? (
                          <Landmark className="w-3.5 h-3.5" />
                        ) : (
                          <Banknote className="w-3.5 h-3.5" />
                        )}
                        <span className="capitalize text-[11px]">
                          {tx.paymentMethod?.toLowerCase() || "Cash"}
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${tx.type === "SOLD"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : tx.type === "RETURNED"
                              ? "bg-amber-500/10 text-amber-500"
                              : tx.type === "DEFECTIVE"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-purple-500/10 text-purple-500"
                          }`}
                      >
                        {tx.type}
                      </span>
                    </td>

                    {/* Total Price */}
                    <td className="p-3.5 font-bold text-foreground whitespace-nowrap">
                      ${tx.price.toFixed(2)}
                    </td>

                    {/* Direct Actions */}
                    <td className="p-3.5 text-right whitespace-nowrap space-x-1">
                      {/* View Details */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTx(tx)}
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                        title="View Complete Audit Log"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </Button>

                      {/* Reprint Invoice */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setSelectedReceipt({
                            invoiceNumber: tx.invoiceNumber,
                            items: [
                              {
                                name: tx.stocks?.products?.name || "Product",
                                serialNumber: tx.stocks?.serialNumber,
                                quantity: tx.quantity,
                                price: tx.price,
                              },
                            ],
                            subtotal: tx.price,
                            vat: 0,
                            total: tx.price,
                            paymentMethod: tx.paymentMethod || "CASH",
                            customerName: tx.customerName || "Walk-in",
                            customerPhone: tx.customerPhone || "N/A",
                            createdAt: tx.createdAt,
                          })
                        }
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                        title="Reprint Invoice Receipt"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </Button>

                      {/* Manager Return Override for Sales */}
                      {tx.type === "SOLD" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setReturnItem(tx)}
                          className="h-7 px-2 text-xs text-amber-500 hover:text-amber-600 border-amber-500/30 hover:bg-amber-500/10"
                          title="Process Return or Warranty Claim"
                        >
                          <RotateCcw className="w-3.5 h-3.5 mr-1" />
                          Return
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div className="p-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground bg-muted/20">
          <span>
            Showing Page {meta.page || 1} of {meta.totalPages || 1}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-7 px-2 text-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.totalPages || isFetching}
              onClick={() => setPage((p) => p + 1)}
              className="h-7 px-2 text-xs"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ManagerAdjustmentDialog
        isOpen={isAdjustmentOpen}
        onClose={() => setIsAdjustmentOpen(false)}
      />

      <TransactionDetailsDialog
        transaction={selectedTx}
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
      />

      <ReturnDialog
        transaction={returnItem}
        isOpen={!!returnItem}
        onClose={() => setReturnItem(null)}
      />

      <PosReceiptDialog
        isOpen={!!selectedReceipt}
        invoiceData={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
    </div>
  );
}
