import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FetchCredits } from '../services/fetch-credits.service';

const { mockPrisma } = vi.hoisted(() => {
  return {
    mockPrisma: {
      credit: {
        findMany: vi.fn(),
        count: vi.fn(),
      },
      $transaction: vi.fn((queries) => Promise.all(queries)),
    },
  };
});

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

describe('FetchCredits Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch credits with default pagination and meta info', async () => {
    const mockCredits = [
      { id: 'crd-1', customerName: 'Abebe', totalAmount: 1000, status: 'PENDING' },
      { id: 'crd-2', customerName: 'Kebede', totalAmount: 2000, status: 'PAID' },
    ];
    mockPrisma.credit.findMany.mockResolvedValueOnce(mockCredits);
    mockPrisma.credit.count.mockResolvedValueOnce(2);

    const result = await FetchCredits({
      page: 1,
      limit: 10,
      order: 'desc',
      sort: 'createdAt',
    });

    expect(result.data).toEqual(mockCredits);
    expect(result.meta).toEqual({
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    });
  });

  it('should apply search and status filters correctly', async () => {
    mockPrisma.credit.findMany.mockResolvedValueOnce([]);
    mockPrisma.credit.count.mockResolvedValueOnce(0);

    await FetchCredits({
      page: 1,
      limit: 10,
      order: 'desc',
      sort: 'createdAt',
      search: 'Abebe',
      status: 'PENDING',
      overdueOnly: 'true',
    });

    expect(mockPrisma.credit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'PENDING',
          dueDate: expect.objectContaining({ lt: expect.any(Date) }),
          OR: expect.arrayContaining([
            { customerName: { contains: 'Abebe', mode: 'insensitive' } },
          ]),
        }),
      })
    );
  });
});
