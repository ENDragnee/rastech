"use client";

import { useState } from "react";
import { useCredits, type CreditItem } from "@/features/credit/hooks/use-credits";
import { CreateCreditDialog } from "@/features/credit/components/create-credit-dialog";
import { CreditStatusDialog } from "@/features/credit/components/credit-status-dialog";
import {
  Search,
  Handshake,
  Plus,
  AlertTriangle,
  Barcode,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Phone,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ManagerCreditsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [page, setPage] = useState(1);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState<CreditItem | null>(null);

  const { data, isLoading } = useCredits(search, statusFilter, overdueOnly, page);

  const credits = data?.data || [];
  const meta = data?.meta || { totalPages: 1, total: 0, page: 1 };

  const totalOutstanding = credits
    .filter((c) => c.status === "PENDING")
    .reduce((acc, c) => acc + c.totalAmount, 0);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            Credit &amp; Debt Registry
          </h1>
          <p className="text-xs text-muted-foreground">
            Track hardware lent on credit, follow up customer dues, and restock returned items.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-full sm:w-64 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search customer, phone, serial..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-8 text-xs bg-card"
            />
          </div>

          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="h-8 text-xs font-semibold gap-1.5 bg-primary"
          >
            <Plus className="w-3.5 h-3.5" /> Issue Credit
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-border pb-2 text-xs">
        <div className="flex gap-2">
          {["ALL", "PENDING", "PAID", "RETURNED", "DEFAULTED"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setStatusFilter(st);
                setOverdueOnly(false);
              }}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${statusFilter === st && !overdueOnly
                  ? "bg-foreground text-background font-semibold"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {st}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setOverdueOnly(true);
              setStatusFilter("PENDING");
            }}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${overdueOnly
                ? "bg-destructive text-destructive-foreground font-semibold"
                : "text-destructive hover:bg-destructive/10"
              }`}
          >
            Overdue Only
          </button>
        </div>

        <div className="text-[11px] text-muted-foreground">
          Pending Debt: <span className="font-bold text-foreground">${totalOutstanding.toFixed(2)}</span>
        </div>
      </div>

      {/* Credits Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <table className="w-full text-xs text-left">
          <thead className="border-b border-border bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
            <tr>
              <th className="p-3.5">Customer &amp; Phone</th>
              <th className="p-3.5">Hardware Item</th>
              <th className="p-3.5">Serial / Batch</th>
              <th className="p-3.5">Due Date</th>
              <th className="p-3.5">Total Debt</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                  Loading credit ledger...
                </td>
              </tr>
            ) : credits.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-muted-foreground">
                  <Handshake className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  No credit records found.
                </td>
              </tr>
            ) : (
              credits.map((c) => {
                const isOverdue =
                  c.status === "PENDING" && c.dueDate && new Date(c.dueDate) < new Date();

                return (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    {/* Customer */}
                    <td className="p-3.5">
                      <div className="font-semibold text-foreground">{c.customerName}</div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" /> {c.customerPhone}
                      </div>
                      {c.customerIdDoc && (
                        <span className="text-[9px] font-mono text-muted-foreground bg-muted px-1 rounded">
                          ID: {c.customerIdDoc}
                        </span>
                      )}
                    </td>

                    {/* Hardware */}
                    <td className="p-3.5 max-w-xs">
                      <div className="font-medium text-foreground line-clamp-1">
                        {c.stock.products.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {c.stock.products.sku} &bull; Qty: {c.quantity}
                      </div>
                    </td>

                    {/* Serial Number */}
                    <td className="p-3.5">
                      {c.stock.serialNumber ? (
                        <span className="font-mono text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-semibold flex items-center gap-1 w-fit">
                          <Barcode className="w-3 h-3" /> {c.stock.serialNumber}
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {c.stock.batchNumber || "Bulk"}
                        </span>
                      )}
                    </td>

                    {/* Due Date */}
                    <td className="p-3.5 whitespace-nowrap">
                      {c.dueDate ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className={isOverdue ? "text-destructive font-bold" : "text-foreground"}>
                            {new Date(c.dueDate).toLocaleDateString()}
                          </span>
                          {isOverdue && (
                            <span className="text-[9px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full font-bold ml-1 flex items-center gap-0.5">
                              <AlertTriangle className="w-2.5 h-2.5" /> OVERDUE
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-[10px]">No due date</span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="p-3.5 font-bold text-foreground whitespace-nowrap">
                      ${c.totalAmount.toFixed(2)}
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${c.status === "PAID"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : c.status === "PENDING"
                              ? "bg-amber-500/10 text-amber-500"
                              : c.status === "RETURNED"
                                ? "bg-blue-500/10 text-blue-500"
                                : "bg-destructive/10 text-destructive"
                          }`}
                      >
                        {c.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="p-3.5 text-right whitespace-nowrap">
                      {c.status === "PENDING" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCredit(c)}
                          className="h-7 px-2.5 text-xs border-primary/40 text-primary hover:bg-primary/10"
                        >
                          Resolve Debt
                        </Button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground font-mono">Settled</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="p-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground bg-muted/20">
          <span>
            Showing Page {meta.page || 1} of {meta.totalPages || 1}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-7 px-2 text-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="h-7 px-2 text-xs"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateCreditDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <CreditStatusDialog
        credit={selectedCredit}
        isOpen={!!selectedCredit}
        onClose={() => setSelectedCredit(null)}
      />
    </div>
  );
}
