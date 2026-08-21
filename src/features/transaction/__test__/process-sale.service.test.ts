import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProcessSaleCheckout } from '../services/process-sale.service';

vi.mock('@/lib/generate-code', () => ({
  GenerateCode: vi.fn(() => 'TEST-SALE-001')
}));

const { mockTx, mockPrisma } = vi.hoisted(() => {
  const tx = {
    stock: {
      findUnique: vi.fn(),
      update: vi.fn()
    },
    transaction: {
      create: vi.fn()
    },
    log: {
      create: vi.fn()
    }
  };
  return {
    mockTx: tx,
    mockPrisma: {
      $transaction: vi.fn((callback) => callback(tx))
    }
  };
});

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma
}));

const mockLogger = { info: vi.fn() } as any;

describe('ProcessSaleCheckout', () => {
  const session = { id: 'user-1', userName: 'testuser', role: 'MANAGER' } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should process multiple items', async () => {
    mockTx.stock.findUnique
      .mockResolvedValueOnce({ id: 's-1', quantity: 10, costPrice: 50, products: { name: 'P1' } })
      .mockResolvedValueOnce({ id: 's-2', quantity: 10, costPrice: 50, products: { name: 'P2' } });

    mockTx.stock.update.mockResolvedValue({});
    mockTx.transaction.create.mockResolvedValue({});
    mockTx.log.create.mockResolvedValue({});

    const body = {
      items: [
        { stockId: 's-1', quantity: 1, price: 100 },
        { stockId: 's-2', quantity: 1, price: 100 },
      ],
      paymentMethod: 'CASH' as const,
    };

    const res = await ProcessSaleCheckout(body, session, mockLogger);
    expect(res.invoiceNumber).toBe('TEST-SALE-001');
    expect(mockTx.transaction.create).toHaveBeenCalledTimes(2);
  });

  it('should throw if price is below cost and not manager', async () => {
    mockTx.stock.findUnique.mockResolvedValue({ id: 's-1', quantity: 10, costPrice: 200, products: { name: 'P1' } });
    
    const body = {
      items: [{ stockId: 's-1', quantity: 1, price: 100 }],
      paymentMethod: 'CASH' as const,
    };

    const staffSession = { ...session, role: 'STAFF' };
    await expect(ProcessSaleCheckout(body, staffSession, mockLogger)).rejects.toThrow(/Price violation/);
  });
});
