import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { ProductCard } from '../components/product-card';

const mockProduct = {
  id: 'prod-1',
  name: 'Test Product',
  sku: 'TEST-SKU-123',
  description: 'This is a test product',
  warrantyDays: 30,
  categoryId: 'cat-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  stocks: [
    {
      id: 'stock-1',
      quantity: 10,
      sellingPrice: 1500,
      costPrice: 1000,
      withVat: true,
      productId: 'prod-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ]
};

test('renders ProductCard with correct details', () => {
  const onSelectMock = vi.fn();
  
  render(<ProductCard product={mockProduct as any} onSelect={onSelectMock} />);
  
  expect(screen.getByText('Test Product')).toBeInTheDocument();
  expect(screen.getByText('TEST-SKU-123')).toBeInTheDocument();
  expect(screen.getByText('This is a test product')).toBeInTheDocument();
  expect(screen.getByText('10 in stock')).toBeInTheDocument();
  expect(screen.getByText('30d Warranty')).toBeInTheDocument();
  expect(screen.getByText('VAT Incl.')).toBeInTheDocument();
  expect(screen.getByText('ETB 1500.00')).toBeInTheDocument();
});

test('calls onSelect when clicked', () => {
  const onSelectMock = vi.fn();
  render(<ProductCard product={mockProduct as any} onSelect={onSelectMock} />);
  
  const button = screen.getByRole('button');
  fireEvent.click(button);
  
  expect(onSelectMock).toHaveBeenCalledTimes(1);
  expect(onSelectMock).toHaveBeenCalledWith(mockProduct);
});

test('disables button and shows Out of Stock when quantity is 0', () => {
  const outOfStockProduct = {
    ...mockProduct,
    stocks: [
      {
        ...mockProduct.stocks[0],
        quantity: 0
      }
    ]
  };
  const onSelectMock = vi.fn();
  render(<ProductCard product={outOfStockProduct as any} onSelect={onSelectMock} />);
  
  const button = screen.getByRole('button');
  expect(button).toBeDisabled();
  expect(screen.getByText('Out of Stock')).toBeInTheDocument();
});
