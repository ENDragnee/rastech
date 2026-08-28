import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateBank } from '../services/update-bank.service';

const { mockPrisma } = vi.hoisted(() => {
  return {
    mockPrisma: {
      bank: {
        update: vi.fn(),
      },
    },
  };
});

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

describe('UpdateBank Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update bank fields and convert BigInt account number to string', async () => {
    mockPrisma.bank.update.mockResolvedValueOnce({
      id: 'b1',
      name: 'Updated CBE',
      accountNumber: BigInt('99998888'),
    });

    const result = await UpdateBank('b1', { name: 'Updated CBE', accountNumber: '99998888' });

    expect(mockPrisma.bank.update).toHaveBeenCalledWith({
      where: { id: 'b1' },
      data: {
        name: 'Updated CBE',
        accountNumber: BigInt('99998888'),
      },
    });

    expect(result).toEqual({
      id: 'b1',
      name: 'Updated CBE',
      accountNumber: '99998888',
    });
  });
});
