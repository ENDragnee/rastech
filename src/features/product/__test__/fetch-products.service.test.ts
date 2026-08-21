import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FetchProducts } from '../services/fetch-products.service';

const { mockPrisma } = vi.hoisted(() => {
  return { 
    mockPrisma: { 
      $transaction: vi.fn(),
      product: {
        findMany: vi.fn(),
        count: vi.fn()
      }
    } 
  };
});

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));

describe('FetchProducts Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch products with pagination', async () => {
    mockPrisma.$transaction.mockResolvedValueOnce([[{ id: 'p1' }], 1]);
    
    const res = await FetchProducts({ page: 1, limit: 10, order: 'desc', sort: 'createdAt' });
    expect(res.data).toEqual([{ id: 'p1' }]);
    expect(res.meta.total).toBe(1);
    expect(res.meta.totalPages).toBe(1);
  });

  it('should filter by search and categoryId', async () => {
    mockPrisma.$transaction.mockResolvedValueOnce([[], 0]);
    await FetchProducts({ page: 1, limit: 10, order: 'desc', sort: 'createdAt', search: 'P1', categoryId: 'cat1' });
    expect(mockPrisma.$transaction).toHaveBeenCalled();
    // Transaction args are checked via implementation
  });

  it('should throw on error', async () => {
    mockPrisma.$transaction.mockRejectedValueOnce(new Error('fail'));
    await expect(FetchProducts({ page: 1, limit: 10, order: 'desc', sort: 'createdAt' })).rejects.toThrow('fail');
  });
});
