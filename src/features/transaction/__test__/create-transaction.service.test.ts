import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateTransaction } from '../services/create-transaction.service';

const { mockTx, mockPrisma } = vi.hoisted(() => {
  const tx = {
    log: { create: vi.fn() },
    transaction: { create: vi.fn(), findUnique: vi.fn() },
    stock: { findUnique: vi.fn(), update: vi.fn() },
  };
  return { mockTx: tx, mockPrisma: { $transaction: vi.fn((cb) => cb(tx)) } };
});

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));
vi.mock('@/lib/generate-code', () => ({ GenerateCode: vi.fn(() => 'INV-123') }));

describe('CreateTransaction Service', () => {
  const mockLogger = {
    info: vi.fn(),
    warn: vi.fn(),
  } as any;

  const mockSession = {
    id: 'user-1',
    userName: 'testuser',
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should process a SOLD transaction successfully', async () => {
    mockTx.stock.findUnique.mockResolvedValueOnce({
      id: 'stock-1',
      quantity: 10,
      serialNumber: 'SN1',
      batchNumber: 'BN1',
      products: { id: 'prod-1', name: 'Laptop', warrantyDays: 30 }
    });
    mockTx.transaction.create.mockResolvedValueOnce({
      id: 'tx-1',
      invoiceNumber: 'INV-123',
    });

    const body = {
      type: 'SOLD' as const,
      stockId: 'stock-1',
      quantity: 2,
      price: 2000,
      paymentMethod: 'CASH' as const,
    };

    const result = await CreateTransaction(body, mockSession, mockLogger);

    expect(mockTx.stock.update).toHaveBeenCalledWith({
      where: { id: 'stock-1' },
      data: { quantity: { decrement: 2 } },
    });
    expect(mockTx.transaction.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        type: 'SOLD',
        quantity: 2,
        price: 2000,
        warrantyEndsAt: expect.any(Date),
      }),
    }));
    expect(mockTx.log.create).toHaveBeenCalled();
    expect(result.id).toBe('tx-1');
  });

  it('should throw error if SOLD transaction has insufficient stock', async () => {
    mockTx.stock.findUnique.mockResolvedValueOnce({
      id: 'stock-1',
      quantity: 1,
      products: { id: 'prod-1', name: 'Laptop', warrantyDays: 30 }
    });

    const body = {
      type: 'SOLD' as const,
      stockId: 'stock-1',
      quantity: 2,
      price: 2000,
      paymentMethod: 'CASH' as const,
    };

    await expect(CreateTransaction(body, mockSession, mockLogger)).rejects.toThrow('Insufficient stock quantity');
  });

  it('should process a RETURNED transaction successfully', async () => {
    mockTx.stock.findUnique.mockResolvedValueOnce({
      id: 'stock-1',
      quantity: 10,
      products: { id: 'prod-1', name: 'Laptop', warrantyDays: 30 }
    });
    mockTx.transaction.findUnique.mockResolvedValueOnce({
      id: 'orig-tx',
      invoiceNumber: 'INV-ORIG',
      warrantyEndsAt: new Date(Date.now() + 10000000), // future
    });
    mockTx.transaction.create.mockResolvedValueOnce({
      id: 'tx-ret',
    });

    const body = {
      type: 'RETURNED' as const,
      stockId: 'stock-1',
      quantity: 1,
      price: 1000,
      originalTransactionId: 'orig-tx',
    };

    await CreateTransaction(body, mockSession, mockLogger);

    expect(mockTx.stock.update).toHaveBeenCalledWith({
      where: { id: 'stock-1' },
      data: { quantity: { increment: 1 } },
    });
    expect(mockTx.transaction.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ invoiceNumber: 'INV-ORIG-RET' })
    }));
  });

  it('should throw error if RETURNED transaction has expired warranty', async () => {
    mockTx.stock.findUnique.mockResolvedValueOnce({
      id: 'stock-1',
      quantity: 10,
      products: { id: 'prod-1', name: 'Laptop' }
    });
    mockTx.transaction.findUnique.mockResolvedValueOnce({
      id: 'orig-tx',
      warrantyEndsAt: new Date(Date.now() - 10000000), // past
    });

    const body = {
      type: 'RETURNED' as const,
      stockId: 'stock-1',
      quantity: 1,
      price: 1000,
      originalTransactionId: 'orig-tx',
    };

    await expect(CreateTransaction(body, mockSession, mockLogger)).rejects.toThrow('Product warranty has expired.');
  });

  it('should process a PURCHASED transaction successfully', async () => {
    mockTx.stock.findUnique.mockResolvedValueOnce({
      id: 'stock-1',
      quantity: 10,
      products: { id: 'prod-1', name: 'Laptop' }
    });
    mockTx.transaction.create.mockResolvedValueOnce({ id: 'tx-2' });

    const body = {
      type: 'PURCHASED' as const,
      stockId: 'stock-1',
      quantity: 5,
      price: 5000,
    };

    await CreateTransaction(body, mockSession, mockLogger);

    expect(mockTx.stock.update).toHaveBeenCalledWith({
      where: { id: 'stock-1' },
      data: { quantity: { increment: 5 } },
    });
  });

  it('should process a ADJUSTMENT_LOSS transaction successfully', async () => {
    mockTx.stock.findUnique.mockResolvedValueOnce({
      id: 'stock-1',
      quantity: 10,
      products: { id: 'prod-1', name: 'Laptop' }
    });
    mockTx.transaction.create.mockResolvedValueOnce({ id: 'tx-2' });

    const body = {
      type: 'ADJUSTMENT_LOSS' as const,
      stockId: 'stock-1',
      quantity: 5,
      price: 5000,
    };

    await CreateTransaction(body, mockSession, mockLogger);

    expect(mockTx.stock.update).toHaveBeenCalledWith({
      where: { id: 'stock-1' },
      data: { quantity: { decrement: 5 } },
    });
  });

  it('should throw error if ADJUSTMENT_LOSS transaction has insufficient stock', async () => {
    mockTx.stock.findUnique.mockResolvedValueOnce({
      id: 'stock-1',
      quantity: 2,
      products: { id: 'prod-1', name: 'Laptop' }
    });

    const body = {
      type: 'ADJUSTMENT_LOSS' as const,
      stockId: 'stock-1',
      quantity: 5,
      price: 5000,
    };

    await expect(CreateTransaction(body, mockSession, mockLogger)).rejects.toThrow('Cannot adjust loss greater than existing stock.');
  });
});
