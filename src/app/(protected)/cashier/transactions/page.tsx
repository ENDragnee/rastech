"use client";

import { useState } from "react";
import {
  useTransactions,
  type TransactionItem,
} from "@/features/transaction/hooks/use-transactions";
import {
  Search,
  RotateCcw,
  Printer,
  Loader2,
  ReceiptText,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  CreditCard,
  Banknote,
  Landmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PosReceiptDialog } from "@/features/pos/components/pos-receipt-dialog";
import { ReturnDialog } from "@/features/transaction/components/return-dialog";

export default function CashierTransactionsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "SOLD" | "RETURNED">("ALL");
  const [page, setPage] = useState(1);

  // Modal states
  const [selectedReceipt, setSelectedReceipt] = useState<{
    invoiceNumber: string;
    items: {
      name: string;
      serialNumber?: string | null;
      quantity: number;
      price: number;
    }[];
    subtotal: number;
    vat: number;
    total: number;
    paymentMethod: string;
    customerName: string;
    customerPhone: string;
    createdAt: string;
  } | null>(null);

  const [returnItem, setReturnItem] = useState<TransactionItem | null>(null);

  const { data, isLoading, isFetching } = useTransactions(search, page);

  const transactions = data?.data || [];
  const meta = data?.meta || { totalPages: 1, total: 0, page: 1 };

  // Filter transactions by status tab
  const filteredTransactions = transactions.filter((tx) => {
    if (typeFilter === "ALL") return true;
    return tx.type === typeFilter;
  });

  return (
    <div className= "space-y-4" >
    {/* Header & Search */ }
    < div className = "flex flex-col sm:flex-row sm:items-center justify-between gap-3" >
      <div>
      <h1 className="text-lg font-semibold tracking-tight text-foreground" >
        Sales & amp; Invoice Registry
          </h1>
          < p className = "text-xs text-muted-foreground" >
            Search invoices, reprint warranty receipts, and process customer returns.
          </p>
              </div>

  {/* Search Bar */ }
  <div className="w-full sm:w-80 relative" >
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
            type="text"
  placeholder = "Search invoice # (e.g. INV-2026-0001)..."
  value = { search }
  onChange = {(e) => {
    setSearch(e.target.value);
    setPage(1);
  }
}
className = "pl-9 h-9 text-xs bg-card"
  />
  </div>
  </div>

{/* Filter Tabs */ }
<div className="flex gap-2 border-b border-border pb-2 text-xs" >
  <button
          type="button"
onClick = {() => setTypeFilter("ALL")}
className = {`px-3 py-1.5 rounded-lg font-medium transition-colors ${typeFilter === "ALL"
    ? "bg-foreground text-background"
    : "text-muted-foreground hover:text-foreground"
  }`}
        >
  All Records({ meta.total })
    </button>
    < button
type = "button"
onClick = {() => setTypeFilter("SOLD")}
className = {`px-3 py-1.5 rounded-lg font-medium transition-colors ${typeFilter === "SOLD"
    ? "bg-emerald-500/15 text-emerald-500 font-semibold"
    : "text-muted-foreground hover:text-foreground"
  }`}
        >
  Completed Sales
    </button>
    < button
type = "button"
onClick = {() => setTypeFilter("RETURNED")}
className = {`px-3 py-1.5 rounded-lg font-medium transition-colors ${typeFilter === "RETURNED"
    ? "bg-amber-500/15 text-amber-500 font-semibold"
    : "text-muted-foreground hover:text-foreground"
  }`}
        >
  Returns & amp; Claims
    </button>
    </div>

{/* Main Table */ }
<div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm" >
  <table className="w-full text-xs text-left" >
    <thead className="border-b border-border bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold" >
      <tr>
      <th className="p-3.5" > Invoice </th>
        < th className = "p-3.5" > Date & amp; Time </th>
          < th className = "p-3.5" > Hardware / Product </th>
            < th className = "p-3.5" > Customer & amp; Warranty </th>
              < th className = "p-3.5" > Payment </th>
                < th className = "p-3.5" > Status </th>
                  < th className = "p-3.5" > Total </th>
                    < th className = "p-3.5 text-right" > Actions </th>
                      </tr>
                      </thead>
                      < tbody className = "divide-y divide-border" >
                      {
                        isLoading?(
              <tr>
                        <td colSpan={ 8 } className = "p-10 text-center text-muted-foreground" >
                          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                            Fetching transactions...
</td>
  </tr>
            ) : filteredTransactions.length === 0 ? (
  <tr>
  <td colSpan= { 8} className = "p-10 text-center text-muted-foreground" >
    <ReceiptText className="w-8 h-8 mx-auto mb-2 opacity-20" />
      No invoice records match your criteria.
                </td>
        </tr>
            ) : (
  filteredTransactions.map((tx) => {
    const isWarrantyValid =
      tx.warrantyEndsAt && new Date(tx.warrantyEndsAt) > new Date();

    return (
      <tr key= { tx.id } className = "hover:bg-muted/30 transition-colors" >
        {/* Invoice ID */ }
        < td className = "p-3.5 font-mono font-semibold text-foreground" >
          { tx.invoiceNumber }
          </td>

    {/* Date */ }
    <td className="p-3.5 text-muted-foreground whitespace-nowrap" >
      { new Date(tx.createdAt).toLocaleDateString() }{ " " }
    <span className="text-[10px] opacity-70" >
    {
      new Date(tx.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    }
      </span>
      </td>

    {/* Hardware Item & Serial Number */ }
    <td className="p-3.5 max-w-xs" >
      <div className="font-medium text-foreground line-clamp-1" >
        { tx.stocks?.products?.name || "Hardware Item" }
        </div>
        < div className = "flex items-center gap-1.5 mt-0.5" >
          <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1 rounded" >
            { tx.stocks?.products?.sku }
            </span>
    {
      tx.stocks?.serialNumber && (
        <span className="font-mono text-[10px] text-primary bg-primary/10 px-1 rounded" >
          SN: { tx.stocks.serialNumber }
      </span>
                        )}
</div>
  </td>

{/* Customer & Warranty Info */ }
<td className="p-3.5" >
  <div className="font-medium text-foreground" >
    { tx.customerName || "Walk-in Customer" }
    </div>
    < div className = "text-[10px] flex items-center gap-1 mt-0.5" >
      {
        tx.warrantyEndsAt ? (
          isWarrantyValid ? (
            <span className= "text-emerald-500 flex items-center gap-0.5" >
            <ShieldCheck className= "w-3 h-3" />
          Warranty Active
          </ span >
                          ) : (
  <span className= "text-muted-foreground flex items-center gap-0.5" >
  <ShieldAlert className="w-3 h-3 text-destructive" />
    Warranty Expired
      </span>
                          )
                        ) : (
  <span className= "text-muted-foreground" > No Warranty </span>
                        )}
</div>
  </td>

{/* Payment Method */ }
<td className="p-3.5" >
  <div className="flex items-center gap-1 text-muted-foreground" >
    {
      tx.paymentMethod === "CARD" ? (
        <CreditCard className= "w-3.5 h-3.5" />
                        ) : tx.paymentMethod === "TRANSFER" ? (
        <Landmark className= "w-3.5 h-3.5" />
                        ) : (
          <Banknote className="w-3.5 h-3.5" />
                        )}
<span className="capitalize text-[11px]" >
  { tx.paymentMethod?.toLowerCase() || "Cash" }
  </span>
  </div>
  </td>

{/* Status Badge */ }
<td className="p-3.5" >
  <span
                        className={
  `inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${tx.type === "SOLD"
    ? "bg-emerald-500/10 text-emerald-500"
    : tx.type === "RETURNED"
      ? "bg-amber-500/10 text-amber-500"
      : "bg-destructive/10 text-destructive"
  }`
}
                      >
  { tx.type }
  </span>
  </td>

{/* Total Price */ }
<td className="p-3.5 font-bold text-foreground whitespace-nowrap" >
  ${ tx.price.toFixed(2) }
</td>

{/* Actions */ }
<td className="p-3.5 text-right space-x-1 whitespace-nowrap" >
  {/* Print Receipt */ }
  < Button
variant = "ghost"
size = "sm"
onClick = {() =>
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
  customerName: tx.customerName || "Customer",
  customerPhone: tx.customerPhone || "N/A",
  createdAt: tx.createdAt,
})
                        }
className = "h-7 px-2 text-xs"
title = "Reprint Receipt"
  >
  <Printer className="w-3.5 h-3.5 mr-1" />
    Receipt
    </Button>

{/* Process Return */ }
{
  tx.type === "SOLD" && (
    <Button
                          variant="outline"
  size = "sm"
  onClick = {() => setReturnItem(tx)
}
className = "h-7 px-2 text-xs text-amber-500 hover:text-amber-600 border-amber-500/30 hover:bg-amber-500/10"
title = "Process Return or Warranty Claim"
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

{/* Pagination Bar */ }
<div className="p-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground bg-muted/20" >
  <span>
  Showing Page { meta.page || 1 } of { meta.totalPages || 1 }
</span>
  < div className = "flex items-center gap-1" >
    <Button
              variant="outline"
size = "sm"
disabled = { page <= 1 || isFetching}
onClick = {() => setPage((p) => Math.max(1, p - 1))}
className = "h-7 px-2 text-xs"
  >
  <ChevronLeft className="w-3.5 h-3.5" /> Previous
    </Button>
    < Button
variant = "outline"
size = "sm"
disabled = { page >= meta.totalPages || isFetching}
onClick = {() => setPage((p) => p + 1)}
className = "h-7 px-2 text-xs"
  >
  Next < ChevronRight className = "w-3.5 h-3.5" />
    </Button>
    </div>
    </div>
    </div>

{/* Modals */ }
<PosReceiptDialog
        isOpen={ !!selectedReceipt }
invoiceData = { selectedReceipt }
onClose = {() => setSelectedReceipt(null)}
      />

  < ReturnDialog
transaction = { returnItem }
isOpen = {!!returnItem}
onClose = {() => setReturnItem(null)}
      />
  </div>
  );
}
