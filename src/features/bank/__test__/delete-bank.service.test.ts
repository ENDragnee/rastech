import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteBank } from '../services/delete-bank.service';

const { mockPrisma } = vi.hoisted(() => {
  return {
    mockPrisma: {
      bank: {
        delete: vi.fn(),
      },
    },
  };
});

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

describe('DeleteBank Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete a bank by ID', async () => {
    mockPrisma.bank.delete.mockResolvedValueOnce({ id: 'b1' });

    const result = await DeleteBank('b1');

    expect(mockPrisma.bank.delete).toHaveBeenCalledWith({ where: { id: 'b1' } });
    expect(result).toEqual({ id: 'b1' });
  });
});
