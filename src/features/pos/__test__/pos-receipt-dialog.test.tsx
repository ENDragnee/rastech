import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PosReceiptDialog } from '../components/pos-receipt-dialog';

describe('PosReceiptDialog', () => {
  const onClose = vi.fn();
  const mockInvoiceData = {
    invoiceNumber: 'INV-001',
    items: [
      { name: 'Product 1', quantity: 2, price: 100 }
    ],
    subtotal: 200,
    vat: 30,
    total: 230,
    paymentMethod: 'CASH',
    customerName: 'Test Customer',
    customerPhone: '1234',
    createdAt: new Date().toISOString()
  };

  it('renders nothing when closed', () => {
    const { container } = render(
      <PosReceiptDialog isOpen={false} invoiceData={mockInvoiceData} onClose={onClose} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders invoice details', () => {
    render(
      <PosReceiptDialog isOpen={true} invoiceData={mockInvoiceData} onClose={onClose} />
    );
    expect(screen.getByText('Invoice #INV-001')).toBeInTheDocument();
    expect(screen.getByText('Customer: Test Customer')).toBeInTheDocument();
    expect(screen.getByText('Product 1')).toBeInTheDocument();
  });

  it('calls window.print on print button click', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    
    render(
      <PosReceiptDialog isOpen={true} invoiceData={mockInvoiceData} onClose={onClose} />
    );
    const printBtn = screen.getByRole('button', { name: /Print Receipt/i });
    fireEvent.click(printBtn);

    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });
});
