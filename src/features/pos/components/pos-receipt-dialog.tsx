"use client";

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Printer, CheckCircle, X } from "lucide-react";

interface PosReceiptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceData: {
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
  } | null;
}

export function PosReceiptDialog({ isOpen, onClose, invoiceData }: PosReceiptDialogProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !invoiceData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-card rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/40">
          <div className="flex items-center gap-2 text-emerald-500">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs font-semibold">Sale Completed</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Area */}
        <div ref={receiptRef} className="p-5 overflow-y-auto space-y-4 text-xs font-mono text-foreground">
          <div className="text-center space-y-1 border-b border-dashed border-border pb-3">
            <h2 className="text-base font-bold tracking-tight">RASTECH ELECTRONICS</h2>
            <p className="text-[10px] text-muted-foreground">Computer & Technology Solutions</p>
            <p className="text-[10px] text-muted-foreground">Invoice #{invoiceData.invoiceNumber}</p>
            <p className="text-[10px] text-muted-foreground">
              {new Date(invoiceData.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="space-y-1 text-[11px] border-b border-dashed border-border pb-3">
            <p>Customer: {invoiceData.customerName}</p>
            <p>Phone: {invoiceData.customerPhone}</p>
            <p>Payment: {invoiceData.paymentMethod}</p>
          </div>

          <div className="space-y-2 border-b border-dashed border-border pb-3">
            {invoiceData.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start">
                <div className="pr-2">
                  <p className="font-semibold text-[11px]">{item.name}</p>
                  {item.serialNumber && (
                    <p className="text-[10px] text-muted-foreground">SN: {item.serialNumber}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <span className="font-semibold"> ETB {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-1 text-[11px] pt-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span> ETB {invoiceData.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">VAT (15%)</span>
              <span> ETB {invoiceData.vat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm pt-1 border-t border-border">
              <span>Total Paid</span>
              <span> ETB {invoiceData.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-border bg-muted/20 flex gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="w-full text-xs">
            Close
          </Button>
          <Button size="sm" onClick={handlePrint} className="w-full text-xs gap-1.5 bg-primary">
            <Printer className="w-3.5 h-3.5" />
            Print Receipt
          </Button>
        </div>
      </div>
    </div>
  );
}
