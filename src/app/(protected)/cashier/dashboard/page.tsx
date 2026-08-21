"use client";

import Link from "next/link";
import { useTransactions } from "@/features/transaction/hooks/use-transactions";
import { ShoppingBag, ReceiptText, ArrowRight, Banknote, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CashierDashboardPage() {
  const { data } = useTransactions("", 1);

  const transactions = data?.data || [];
  const totalSalesToday = transactions
    .filter((t) => t.type === "SOLD")
    .reduce((acc, t) => acc + t.price, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Cashier Overview</h1>
          <p className="text-xs text-muted-foreground">Ready for transactions and POS checkout.</p>
        </div>
        <Link href="/cashier/pos">
          <Button className="text-xs font-semibold gap-1.5 bg-primary">
            <ShoppingBag className="w-4 h-4" />
            Open POS Checkout
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex justify-between items-center text-muted-foreground mb-2">
            <span className="text-xs font-medium">Recent Sales Volume</span>
            <Banknote className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-bold text-foreground"> ETB {totalSalesToday.toFixed(2)}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex justify-between items-center text-muted-foreground mb-2">
            <span className="text-xs font-medium">Processed Invoices</span>
            <ReceiptText className="w-4 h-4 text-primary" />
          </div>
          <span className="text-2xl font-bold text-foreground">{transactions.length}</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex justify-between items-center text-muted-foreground mb-2">
            <span className="text-xs font-medium">Returns Recorded</span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-bold text-foreground">
            {transactions.filter((t) => t.type === "RETURNED").length}
          </span>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-xs font-semibold text-foreground">Recent Transactions</h2>
          <Link href="/cashier/transactions" className="text-xs text-primary hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-border">
          {transactions.slice(0, 5).map((tx) => (
            <div key={tx.id} className="py-2.5 flex justify-between items-center text-xs">
              <div>
                <span className="font-mono font-semibold">{tx.invoiceNumber}</span>
                <span className="text-muted-foreground ml-2">
                  {tx.stocks?.products?.name || "Product"}
                </span>
              </div>
              <span className="font-bold"> ETB {tx.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
