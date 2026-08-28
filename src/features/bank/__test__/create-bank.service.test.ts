import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateBank } from '../services/create-bank.service';

const { mockPrisma } = vi.hoisted(() => {
  return {
    mockPrisma: {
      bank: {
        create: vi.fn(),
      },
    },
  };
});

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

describe('CreateBank Service', () => {
  const mockSession = { id: 'user-1' } as any;
  const mockLogger = { info: vi.fn() } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a bank with stringified BigInt account number', async () => {
    mockPrisma.bank.create.mockResolvedValueOnce({
      id: 'bank-1',
      name: 'CBE',
      accountNumber: BigInt('100012345678'),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await CreateBank(
      { name: 'CBE', accountNumber: '100012345678' },
      mockSession,
      mockLogger
    );

    expect(mockPrisma.bank.create).toHaveBeenCalledWith({
      data: {
        name: 'CBE',
        accountNumber: BigInt('100012345678'),
      },
    });

    expect(result.accountNumber).toBe('100012345678');
    expect(mockLogger.info).toHaveBeenCalledWith({ bankId: 'bank-1' }, 'Bank created');
  });

  it('should create a bank without account number', async () => {
    mockPrisma.bank.create.mockResolvedValueOnce({
      id: 'bank-2',
      name: 'BOA',
      accountNumber: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await CreateBank(
      { name: 'BOA' },
      mockSession,
      mockLogger
    );

    expect(result.accountNumber).toBeNull();
  });
});
