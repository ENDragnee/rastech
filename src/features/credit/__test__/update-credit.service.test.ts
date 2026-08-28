import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateCredit } from '../services/update-credit.service';

const { mockTx, mockPrisma } = vi.hoisted(() => {
  const tx = {
    credit: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    stock: {
      update: vi.fn(),
    },
    log: {
      create: vi.fn(),
    },
  };
  return {
    mockTx: tx,
    mockPrisma: {
      $transaction: vi.fn((cb) => cb(tx)),
    },
  };
});

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

describe('UpdateCredit Service', () => {
  const mockSession = { id: 'user-1', userName: 'manager_user' } as any;
  const mockLogger = { info: vi.fn() } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw an error if credit record is not found', async () => {
    mockTx.credit.findUnique.mockResolvedValueOnce(null);

    await expect(
      UpdateCredit('crd-99', { status: 'PAID' }, mockSession, mockLogger)
    ).rejects.toThrow('Credit record not found.');
  });

  it('should throw an error if trying to modify an already resolved credit', async () => {
    mockTx.credit.findUnique.mockResolvedValueOnce({
      id: 'crd-1',
      status: 'PAID',
      stock: { products: { name: 'Mouse' } },
    });

    await expect(
      UpdateCredit('crd-1', { status: 'DEFAULTED' }, mockSession, mockLogger)
    ).rejects.toThrow('Cannot modify credit already marked as PAID');
  });

  it('should update credit status to PAID successfully', async () => {
    const existing = {
      id: 'crd-1',
      status: 'PENDING',
      customerName: 'Abebe',
      stockId: 'stock-1',
      quantity: 1,
      stock: { products: { name: 'Mouse' } },
    };

    mockTx.credit.findUnique.mockResolvedValueOnce(existing);
    mockTx.credit.update.mockResolvedValueOnce({
      ...existing,
      status: 'PAID',
      approvedById: 'user-1',
    });
    mockTx.log.create.mockResolvedValueOnce({ id: 'log-1' });

    const result = await UpdateCredit(
      'crd-1',
      { status: 'PAID', notes: 'Paid in cash' },
      mockSession,
      mockLogger
    );

    expect(result.status).toBe('PAID');
    expect(mockTx.stock.update).not.toHaveBeenCalled();
    expect(mockTx.credit.update).toHaveBeenCalledWith({
      where: { id: 'crd-1' },
      data: {
        status: 'PAID',
        approvedById: 'user-1',
      },
      include: expect.any(Object),
    });
    expect(mockTx.log.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: 'CREDIT_PAID',
        severity: 'INFO',
        targetId: 'crd-1',
      }),
    });
  });

  it('should increment stock quantity when credit status changes to RETURNED', async () => {
    const existing = {
      id: 'crd-1',
      status: 'PENDING',
      customerName: 'Abebe',
      stockId: 'stock-1',
      quantity: 3,
      stock: { products: { name: 'Mouse' } },
    };

    mockTx.credit.findUnique.mockResolvedValueOnce(existing);
    mockTx.stock.update.mockResolvedValueOnce({});
    mockTx.credit.update.mockResolvedValueOnce({
      ...existing,
      status: 'RETURNED',
      approvedById: 'user-1',
    });
    mockTx.log.create.mockResolvedValueOnce({});

    const result = await UpdateCredit(
      'crd-1',
      { status: 'RETURNED' },
      mockSession,
      mockLogger
    );

    expect(result.status).toBe('RETURNED');
    expect(mockTx.stock.update).toHaveBeenCalledWith({
      where: { id: 'stock-1' },
      data: { quantity: { increment: 3 } },
    });
  });
});
