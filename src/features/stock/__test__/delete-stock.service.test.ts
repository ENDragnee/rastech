import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteStock } from '../services/delete-stock.service';
import { NextResponse } from 'next/server';

const { mockTx, mockPrisma } = vi.hoisted(() => {
  const tx = {
    stock: { findUnique: vi.fn(), delete: vi.fn() },
    log: { create: vi.fn() },
    transaction: { deleteMany: vi.fn() }
  };
  return { mockTx: tx, mockPrisma: { $transaction: vi.fn(async (cb) => cb(tx)) } };
});

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));
vi.mock('next/server', () => ({
  NextResponse: { json: vi.fn((data, opts) => ({ data, opts })) }
}));

describe('DeleteStock Service', () => {
  const mockSession = { id: 'u1', userName: 'testuser' } as any;
  const mockLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete stock successfully', async () => {
    mockTx.stock.findUnique.mockResolvedValueOnce({ id: 's1', products: { name: 'P1' } });
    mockTx.stock.delete.mockResolvedValueOnce({ id: 's1' });
    
    const result = await DeleteStock(mockSession, { id: 's1' }, mockLogger);
    
    expect(result).toEqual({ id: 's1' });
    expect(mockTx.transaction.deleteMany).toHaveBeenCalledWith({ where: { stockId: 's1' } });
    expect(mockTx.stock.delete).toHaveBeenCalledWith({ where: { id: 's1' } });
    expect(mockTx.log.create).toHaveBeenCalled();
  });

  it('should fail if stock not found', async () => {
    mockTx.stock.findUnique.mockResolvedValueOnce(null);
    await expect(DeleteStock(mockSession, { id: 's1' }, mockLogger)).rejects.toThrow('Stock record not found.');
    expect(mockLogger.error).toHaveBeenCalled();
  });

  it('should return 400 if ID is missing', async () => {
    await DeleteStock(mockSession, undefined, mockLogger);
    expect(NextResponse.json).toHaveBeenCalledWith({ error: 'Stock ID required' }, { status: 400 });
  });
});
