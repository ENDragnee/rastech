import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProcessReturnClaim } from '../services/process-return.service';

const { mockTx, mockPrisma } = vi.hoisted(() => {
  const tx = {
    stock: { update: vi.fn() },
    transaction: {
      findUnique: vi.fn(),
      create: vi.fn()
    },
    log: { create: vi.fn() }
  };
  return {
    mockTx: tx,
    mockPrisma: { $transaction: vi.fn((callback) => callback(tx)) }
  };
});

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));

const mockLogger = { info: vi.fn() } as any;

describe('ProcessReturnClaim', () => {
  const session = { id: 'u-1', userName: 'test' } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw if returning more than bought', async () => {
    mockTx.transaction.findUnique.mockResolvedValueOnce({
      id: 'tx-1', type: 'SOLD', quantity: 1, stockId: 's-1', invoiceNumber: 'INV1',
      stocks: { products: { name: 'P1' } }
    });

    const body = {
      originalTransactionId: 'tx-1',
      type: 'RETURNED' as const,
      quantity: 2,
      reason: 'test'
    };

    await expect(ProcessReturnClaim(body, session, mockLogger)).rejects.toThrow(/Cannot return more/);
  });

  it('should process return successfully', async () => {
    mockTx.transaction.findUnique.mockResolvedValueOnce({
      id: 'tx-1', type: 'SOLD', quantity: 5, stockId: 's-1', invoiceNumber: 'INV1',
      price: 100, paymentMethod: 'CASH',
      stocks: { products: { name: 'P1' } }
    });
    mockTx.stock.update.mockResolvedValueOnce({});
    mockTx.transaction.create.mockResolvedValueOnce({ id: 'ret-1' });
    mockTx.log.create.mockResolvedValueOnce({});

    const body = {
      originalTransactionId: 'tx-1',
      type: 'RETURNED' as const,
      quantity: 1,
      reason: 'test'
    };

    const res = await ProcessReturnClaim(body, session, mockLogger);
    expect(res).toEqual({ id: 'ret-1' });
    expect(mockTx.stock.update).toHaveBeenCalledWith({
      where: { id: 's-1' },
      data: { quantity: { increment: 1 } }
    });
  });
});
