import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateStock } from '../services/update-stock.service';
import { NextResponse } from 'next/server';

const { mockTx, mockPrisma } = vi.hoisted(() => {
  const tx = {
    stock: { update: vi.fn() },
    log: { create: vi.fn() }
  };
  return { mockTx: tx, mockPrisma: { $transaction: vi.fn(async (cb) => cb(tx)) } };
});

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));
vi.mock('next/server', () => ({
  NextResponse: { json: vi.fn((data, opts) => ({ data, opts })) }
}));

describe('UpdateStock Service', () => {
  const mockSession = { id: 'u1', userName: 'testuser' } as any;
  const mockLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update stock successfully', async () => {
    mockTx.stock.update.mockResolvedValueOnce({ id: 's1', quantity: 20 });
    
    const res = await UpdateStock({ quantity: 20 }, mockSession, { id: 's1' }, mockLogger);
    expect(res).toEqual({ id: 's1', quantity: 20 });
    expect(mockTx.stock.update).toHaveBeenCalled();
    expect(mockTx.log.create).toHaveBeenCalled();
    expect(mockLogger.info).toHaveBeenCalled();
  });

  it('should return error if no id', async () => {
    await UpdateStock({}, mockSession, undefined, mockLogger);
    expect(NextResponse.json).toHaveBeenCalledWith({ error: 'Stock ID required' }, { status: 400 });
  });
});
