import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateStock } from '../services/create-stock.service';

const { mockTx, mockPrisma } = vi.hoisted(() => {
  const tx = {
    stock: { create: vi.fn() },
    log: { create: vi.fn() },
    transaction: { create: vi.fn() }
  };
  return { mockTx: tx, mockPrisma: { $transaction: vi.fn(async (cb) => cb(tx)) } };
});

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));
vi.mock('@/lib/generate-code', () => ({ GenerateCode: vi.fn(() => 'CODE123') }));

describe('CreateStock Service', () => {
  const mockSession = { id: 'u1', userName: 'testuser' } as any;
  const mockLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create stock and log transaction', async () => {
    mockTx.stock.create.mockResolvedValueOnce({ id: 's1', quantity: 10, costPrice: 5 });
    
    const result = await CreateStock({
      quantity: 10, costPrice: 5, sellingPrice: 10, productId: 'p1', withVat: true
    }, mockSession, mockLogger);
    
    expect(result).toHaveProperty('id', 's1');
    expect(mockTx.stock.create).toHaveBeenCalled();
    expect(mockTx.log.create).toHaveBeenCalled();
    expect(mockTx.transaction.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        invoiceNumber: 'CODE123',
        type: 'PURCHASED'
      })
    }));
    expect(mockLogger.info).toHaveBeenCalled();
  });
});
