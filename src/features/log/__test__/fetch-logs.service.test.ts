import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FetchLogs } from '../services/fetch-logs.service';

const { mockTx, mockPrisma } = vi.hoisted(() => {
  const tx = {
    log: { findMany: vi.fn(), count: vi.fn() },
  };
  return { mockTx: tx, mockPrisma: { ...tx, $transaction: vi.fn((cb) => {
    if (Array.isArray(cb)) {
      return Promise.all(cb);
    }
    return cb(tx);
  }) } };
});

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));

describe('FetchLogs Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch logs with default pagination and return stats', async () => {
    const mockLogs = [{ id: 'log-1', message: 'test log' }];
    mockPrisma.log.findMany.mockResolvedValueOnce(mockLogs);
    mockPrisma.log.count
      .mockResolvedValueOnce(10) // count total
      .mockResolvedValueOnce(4)  // count info
      .mockResolvedValueOnce(3)  // count warning
      .mockResolvedValueOnce(2)  // count error
      .mockResolvedValueOnce(1); // count fatal

    const req = {
      page: 1,
      limit: 20,
      sort: 'createdAt' as const,
      order: 'desc' as const,
    };

    const result = await FetchLogs(req);

    expect(mockPrisma.$transaction).toHaveBeenCalled();
    expect(mockPrisma.log.findMany).toHaveBeenCalledWith({
      where: {},
      skip: 0,
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, userName: true } },
      },
    });

    expect(result).toEqual({
      data: mockLogs,
      stats: { total: 10, info: 4, warning: 3, error: 2, fatal: 1 },
      meta: { total: 10, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrev: false },
    });
  });

  it('should build where clause with search, severity, type, userId, and dates', async () => {
    const mockLogs = [];
    mockPrisma.log.findMany.mockResolvedValueOnce(mockLogs);
    mockPrisma.log.count
      .mockResolvedValueOnce(0) // total
      .mockResolvedValueOnce(0) // info
      .mockResolvedValueOnce(0) // warning
      .mockResolvedValueOnce(0) // error
      .mockResolvedValueOnce(0); // fatal

    const req = {
      page: 2,
      limit: 10,
      sort: 'severity' as const,
      order: 'asc' as const,
      search: 'query',
      severity: 'ERROR' as const,
      type: 'TEST_TYPE',
      userId: 'user-1',
      startDate: '2026-08-20',
      endDate: '2026-08-21',
    };

    const result = await FetchLogs(req);

    const expectedCreatedAtClause = {
      gte: new Date('2026-08-20'),
      lte: new Date(new Date('2026-08-21').setHours(23, 59, 59, 999)),
    };

    const expectedWhereClause = {
      severity: 'ERROR',
      type: { contains: 'TEST_TYPE', mode: 'insensitive' },
      userId: 'user-1',
      createdAt: expectedCreatedAtClause,
      OR: [
        { message: { contains: 'query', mode: 'insensitive' } },
        { type: { contains: 'query', mode: 'insensitive' } },
        { targetName: { contains: 'query', mode: 'insensitive' } },
        { targetId: { contains: 'query', mode: 'insensitive' } },
        { ipAddress: { contains: 'query', mode: 'insensitive' } },
        {
          user: {
            OR: [
              { userName: { contains: 'query', mode: 'insensitive' } },
              { name: { contains: 'query', mode: 'insensitive' } },
            ],
          },
        },
      ],
    };

    expect(mockPrisma.log.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expectedWhereClause,
      skip: 10,
      take: 10,
      orderBy: { severity: 'asc' },
    }));

    expect(result.meta).toEqual({
      total: 0,
      page: 2,
      limit: 10,
      totalPages: 1,
      hasNext: false,
      hasPrev: true,
    });
  });

  it('should rethrow errors from prisma', async () => {
    const error = new Error('DB Error');
    mockPrisma.$transaction.mockRejectedValueOnce(error);

    const req = {
      page: 1,
      limit: 20,
      sort: 'createdAt' as const,
      order: 'desc' as const,
    };

    await expect(FetchLogs(req)).rejects.toThrow('DB Error');
  });
});
