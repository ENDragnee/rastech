import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PosSerialDialog } from '../components/pos-serial-dialog';

describe('PosSerialDialog', () => {
  const onClose = vi.fn();
  const onSelectStock = vi.fn();
  const mockProduct = {
    id: 'p-1',
    name: 'Test Product',
    sku: 'SKU-001',
    stocks: [
      { id: 's-1', quantity: 5, serialNumber: 'SN-001', batchNumber: null, sellingPrice: 100, costPrice: 50 },
      { id: 's-2', quantity: 0, serialNumber: 'SN-002', batchNumber: null, sellingPrice: 100, costPrice: 50 },
      { id: 's-3', quantity: 10, serialNumber: null, batchNumber: 'BATCH-1', sellingPrice: 100, costPrice: 50 }
    ]
  } as any;

  it('renders nothing when closed', () => {
    const { container } = render(
      <PosSerialDialog isOpen={false} product={mockProduct} onClose={onClose} onSelectStock={onSelectStock} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders available stocks', () => {
    render(
      <PosSerialDialog isOpen={true} product={mockProduct} onClose={onClose} onSelectStock={onSelectStock} />
    );
    // Should render SN-001 and BATCH-1, but not SN-002 because quantity is 0
    expect(screen.getByText('SN: SN-001')).toBeInTheDocument();
    expect(screen.getByText('Batch: BATCH-1')).toBeInTheDocument();
    expect(screen.queryByText('SN: SN-002')).not.toBeInTheDocument();
  });

  it('filters stocks based on search', () => {
    render(
      <PosSerialDialog isOpen={true} product={mockProduct} onClose={onClose} onSelectStock={onSelectStock} />
    );
    const searchInput = screen.getByPlaceholderText(/Filter by/i);
    fireEvent.change(searchInput, { target: { value: 'BATCH' } });

    expect(screen.getByText('Batch: BATCH-1')).toBeInTheDocument();
    expect(screen.queryByText('SN: SN-001')).not.toBeInTheDocument();
  });

  it('calls onSelectStock and onClose when a stock is clicked', () => {
    render(
      <PosSerialDialog isOpen={true} product={mockProduct} onClose={onClose} onSelectStock={onSelectStock} />
    );
    const stockBtn = screen.getByText('SN: SN-001').closest('button');
    fireEvent.click(stockBtn!);

    expect(onSelectStock).toHaveBeenCalledWith(mockProduct.stocks[0]);
    expect(onClose).toHaveBeenCalled();
  });
});
