import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FetchTransactions } from '../services/fetch-transactions.service';

const { mockPrisma } = vi.hoisted(() => {
  return {
    mockPrisma: {
      $transaction: vi.fn(),
      transaction: {
        findMany: vi.fn(),
        count: vi.fn()
      }
    }
  };
});

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma
}));

describe('FetchTransactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch transactions and return formatted result', async () => {
    const mockData = [{ id: 'tx-1' }];
    mockPrisma.$transaction.mockResolvedValueOnce([mockData, 1]);

    const req = {
      page: 1,
      limit: 10,
      order: 'desc' as const,
      sort: 'createdAt' as const,
    };

    const result = await FetchTransactions(req);
    expect(result.data).toEqual(mockData);
    expect(result.meta.total).toBe(1);
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });
});
