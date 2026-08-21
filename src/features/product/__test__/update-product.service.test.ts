import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateProduct } from '../services/update-product.service';
import { NextResponse } from 'next/server';

const { mockTx, mockPrisma } = vi.hoisted(() => {
  const tx = {
    category: { findUnique: vi.fn() },
    product: { update: vi.fn() },
    stock: { updateMany: vi.fn() },
    log: { create: vi.fn() }
  };
  return { mockTx: tx, mockPrisma: { $transaction: vi.fn(async (cb) => cb(tx)) } };
});

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));
vi.mock('next/server', () => ({
  NextResponse: { json: vi.fn((data, opts) => ({ data, opts })) }
}));

describe('UpdateProduct Service', () => {
  const mockSession = { id: 'u1', userName: 'testuser' } as any;
  const mockLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update product successfully', async () => {
    mockTx.category.findUnique.mockResolvedValueOnce({ id: 'cat1' });
    mockTx.product.update.mockResolvedValueOnce({ id: 'p1', name: 'Updated' });
    
    const res = await UpdateProduct({ categoryId: 'cat1', withVat: false }, mockSession, { id: 'p1' }, mockLogger);
    expect(res).toEqual({ id: 'p1', name: 'Updated' });
    expect(mockTx.product.update).toHaveBeenCalled();
    expect(mockTx.stock.updateMany).toHaveBeenCalled(); // Since withVat is defined
  });

  it('should return error if no id', async () => {
    await UpdateProduct({}, mockSession, undefined, mockLogger);
    expect(NextResponse.json).toHaveBeenCalledWith({ error: 'Product ID required' }, { status: 400 });
  });

  it('should handle P2003 missing category', async () => {
    mockTx.category.findUnique.mockResolvedValueOnce(null);
    await UpdateProduct({ categoryId: 'cat1' }, mockSession, { id: 'p1' }, mockLogger);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "The selected category does not exist. Please re-select a category." },
      { status: 400 }
    );
  });
  
  it('should handle P2002 duplicate SKU', async () => {
    mockPrisma.$transaction.mockRejectedValueOnce({ code: 'P2002' });
    await UpdateProduct({ sku: 's2' }, mockSession, { id: 'p1' }, mockLogger);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "The SKU is already taken. Please choose another." },
      { status: 400 }
    );
  });
});
