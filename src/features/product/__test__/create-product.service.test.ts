import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateProduct } from '../services/create-product';
import { NextResponse } from 'next/server';

const { mockTx, mockPrisma } = vi.hoisted(() => {
  const tx = {
    category: { findUnique: vi.fn() },
    product: { create: vi.fn() },
    log: { create: vi.fn() }
  };
  return { mockTx: tx, mockPrisma: { $transaction: vi.fn(async (cb) => cb(tx)) } };
});

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));
vi.mock('next/server', () => ({
  NextResponse: { json: vi.fn((data, opts) => ({ data, opts })) }
}));

describe('CreateProduct Service', () => {
  const mockSession = { id: 'u1', userName: 'testuser' } as any;
  const mockLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a product successfully', async () => {
    mockTx.category.findUnique.mockResolvedValueOnce({ id: 'cat1' });
    mockTx.product.create.mockResolvedValueOnce({ id: 'p1', name: 'P1', sku: 'S1', warrantyDays: 0, withVat: true });
    
    const result = await CreateProduct({ name: 'P1', sku: 'S1', categoryId: 'cat1' }, mockSession, mockLogger);
    
    expect(result).toHaveProperty('id', 'p1');
    expect(mockTx.product.create).toHaveBeenCalled();
    expect(mockTx.log.create).toHaveBeenCalled();
  });

  it('should throw P2003 if category does not exist', async () => {
    mockTx.category.findUnique.mockResolvedValueOnce(null);
    
    const res = await CreateProduct({ name: 'P1', sku: 'S1', categoryId: 'cat1' }, mockSession, mockLogger);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "The selected category does not exist. Please re-select a category." },
      { status: 400 }
    );
  });

  it('should handle P2002 duplicate SKU', async () => {
    mockPrisma.$transaction.mockRejectedValueOnce({ code: 'P2002' });
    
    const res = await CreateProduct({ name: 'P1', sku: 'S1', categoryId: 'cat1' }, mockSession, mockLogger);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "The SKU is already taken. Please choose another." },
      { status: 400 }
    );
  });

  it('should rethrow unknown errors', async () => {
    const error = new Error('Random DB error');
    mockPrisma.$transaction.mockRejectedValueOnce(error);
    
    await expect(CreateProduct({ name: 'P1', sku: 'S1', categoryId: 'cat1' }, mockSession, mockLogger)).rejects.toThrow('Random DB error');
  });
});
