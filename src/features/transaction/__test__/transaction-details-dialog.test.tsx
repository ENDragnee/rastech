import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TransactionDetailsDialog } from '../components/transaction-details-dialog';

describe('TransactionDetailsDialog', () => {
  const mockTransaction = {
    id: 'tx-1',
    invoiceNumber: 'INV-123',
    type: 'SOLD',
    quantity: 1,
    price: 1500,
    paymentMethod: 'CASH',
    createdAt: new Date().toISOString(),
    customerName: 'Test Customer',
    customerPhone: '123456789',
    warrantyEndsAt: new Date(Date.now() + 86400000).toISOString(),
    stocks: {
      serialNumber: 'SN123',
      products: {
        name: 'Test Product',
        sku: 'SKU-001'
      }
    },
    users: {
      userName: 'testuser'
    }
  } as any;

  it('renders nothing if not open', () => {
    const { container } = render(
      <TransactionDetailsDialog isOpen={false} transaction={mockTransaction} onClose={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders transaction details when open', () => {
    const onClose = vi.fn();
    render(
      <TransactionDetailsDialog isOpen={true} transaction={mockTransaction} onClose={onClose} />
    );
    
    expect(screen.getByText('INV-123')).toBeInTheDocument();
    expect(screen.getByText('SOLD')).toBeInTheDocument();
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('SKU: SKU-001')).toBeInTheDocument();
    expect(screen.getByText('SN: SN123')).toBeInTheDocument();
    expect(screen.getByText('Test Customer')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <TransactionDetailsDialog isOpen={true} transaction={mockTransaction} onClose={onClose} />
    );
    
    const closeButtons = screen.getAllByRole('button');
    fireEvent.click(closeButtons[0]);
    expect(onClose).toHaveBeenCalled();
  });
});
