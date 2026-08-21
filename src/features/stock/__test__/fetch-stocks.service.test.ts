import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FetchStocks } from '../services/fetch-stocks.service';

const { mockPrisma } = vi.hoisted(() => {
  return { 
    mockPrisma: { 
      $transaction: vi.fn(),
      stock: {
        findMany: vi.fn(),
        count: vi.fn()
      }
    } 
  };
});

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));

describe('FetchStocks Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch stock with pagination', async () => {
    mockPrisma.$transaction.mockResolvedValueOnce([[{ id: 's1' }], 1]);
    
    const res = await FetchStocks({ page: 1, limit: 10, order: 'desc', sort: 'createdAt' });
    expect(res.data).toEqual([{ id: 's1' }]);
    expect(res.meta.total).toBe(1);
    expect(res.meta.totalPages).toBe(1);
  });

  it('should throw on error', async () => {
    mockPrisma.$transaction.mockRejectedValueOnce(new Error('fail'));
    await expect(FetchStocks({ page: 1, limit: 10, order: 'desc', sort: 'createdAt' })).rejects.toThrow('fail');
  });
});
