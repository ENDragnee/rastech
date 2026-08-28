import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PosCheckoutDialog } from '../components/pos-checkout-dialog';

vi.mock('@/features/bank/hooks/use-banks', () => ({
  useBanks: () => ({ data: [{ id: 'bank-1', name: 'CBE', accountNumber: '1000' }] })
}));

describe('PosCheckoutDialog', () => {
  const onConfirm = vi.fn();
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when closed', () => {
    const { container } = render(
      <PosCheckoutDialog isOpen={false} totalAmount={100} isLoading={false} onClose={onClose} onConfirm={onConfirm} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders and submits with correct data', () => {
    render(
      <PosCheckoutDialog isOpen={true} totalAmount={100} isLoading={false} onClose={onClose} onConfirm={onConfirm} />
    );

    // Default cash is selected
    const nameInput = screen.getByPlaceholderText(/Customer Full Name/i);
    const phoneInput = screen.getByPlaceholderText(/Phone Number/i);
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(phoneInput, { target: { value: '12345678' } });

    const submitBtn = screen.getByRole('button', { name: /Confirm & Print Invoice/i });
    fireEvent.click(submitBtn);

    expect(onConfirm).toHaveBeenCalledWith({
      paymentMethod: 'CASH',
      bankId: undefined,
      customerName: 'John Doe',
      customerPhone: '12345678'
    });
  });

  it('changes payment method', () => {
    render(
      <PosCheckoutDialog isOpen={true} totalAmount={100} isLoading={false} onClose={onClose} onConfirm={onConfirm} />
    );

    const cardBtn = screen.getByRole('button', { name: /Card/i });
    fireEvent.click(cardBtn);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'bank-1' } });

    const submitBtn = screen.getByRole('button', { name: /Confirm & Print Invoice/i });
    fireEvent.click(submitBtn);

    expect(onConfirm).toHaveBeenCalledWith({
      paymentMethod: 'CARD',
      bankId: 'bank-1',
      customerName: undefined,
      customerPhone: undefined
    });
  });

  it('shows loading state', () => {
    render(
      <PosCheckoutDialog isOpen={true} totalAmount={100} isLoading={true} onClose={onClose} onConfirm={onConfirm} />
    );
    expect(screen.getByRole('button', { name: /Processing/i })).toBeDisabled();
  });
});

