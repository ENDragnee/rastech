import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FetchBanks } from '../services/fetch-banks.service';

const { mockPrisma } = vi.hoisted(() => {
  return {
    mockPrisma: {
      bank: {
        findMany: vi.fn(),
      },
    },
  };
});

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

describe('FetchBanks Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch banks and stringify BigInt account numbers', async () => {
    mockPrisma.bank.findMany.mockResolvedValueOnce([
      { id: 'b1', name: 'CBE', accountNumber: BigInt('1000123') },
      { id: 'b2', name: 'Awash', accountNumber: null },
    ]);

    const result = await FetchBanks({});

    expect(result).toEqual([
      { id: 'b1', name: 'CBE', accountNumber: '1000123' },
      { id: 'b2', name: 'Awash', accountNumber: null },
    ]);
  });

  it('should apply search filter when provided', async () => {
    mockPrisma.bank.findMany.mockResolvedValueOnce([]);

    await FetchBanks({ search: 'Dashen' });

    expect(mockPrisma.bank.findMany).toHaveBeenCalledWith({
      where: {
        name: { contains: 'Dashen', mode: 'insensitive' },
      },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  });
});
