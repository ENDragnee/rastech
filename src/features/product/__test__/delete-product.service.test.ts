import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteProduct } from '../services/delete-product.service';
import { NextResponse } from 'next/server';

const { mockTx, mockPrisma } = vi.hoisted(() => {
  const tx = {
    product: { delete: vi.fn() },
    log: { create: vi.fn() }
  };
  return { mockTx: tx, mockPrisma: { $transaction: vi.fn(async (cb) => cb(tx)) } };
});

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));
vi.mock('next/server', () => ({
  NextResponse: { json: vi.fn((data, opts) => ({ data, opts })) }
}));

describe('DeleteProduct Service', () => {
  const mockSession = { id: 'u1', userName: 'testuser' } as any;
  const mockLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully delete a product', async () => {
    await DeleteProduct(mockSession, { id: 'p1' }, mockLogger);
    expect(mockTx.product.delete).toHaveBeenCalledWith({ where: { id: 'p1' } });
    expect(mockTx.log.create).toHaveBeenCalled();
    expect(mockLogger.info).toHaveBeenCalled();
  });

  it('should return 400 if ID is missing', async () => {
    await DeleteProduct(mockSession, undefined, mockLogger);
    expect(mockLogger.warn).toHaveBeenCalled();
    expect(NextResponse.json).toHaveBeenCalledWith({ error: 'Product ID required' }, { status: 400 });
  });

  it('should throw on db error', async () => {
    mockPrisma.$transaction.mockRejectedValueOnce(new Error('DB failure'));
    await expect(DeleteProduct(mockSession, { id: 'p1' }, mockLogger)).rejects.toThrow('DB failure');
  });
});
