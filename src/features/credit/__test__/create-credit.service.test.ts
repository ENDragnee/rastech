import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateCredit } from '../services/create-credit.service';

const { mockTx, mockPrisma } = vi.hoisted(() => {
  const tx = {
    stock: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    transaction: {
      create: vi.fn(),
    },
    credit: {
      create: vi.fn(),
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

vi.mock('@/lib/generate-code', () => ({
  GenerateCode: vi.fn(() => 'CODE123'),
}));

describe('CreateCredit Service', () => {
  const mockSession = { id: 'user-1', userName: 'john_cashier' } as any;
  const mockLogger = { info: vi.fn() } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw an error if stock item is not found', async () => {
    mockTx.stock.findUnique.mockResolvedValueOnce(null);

    const input = {
      stockId: 'invalid-stock',
      quantity: 1,
      totalAmount: 1000,
      customerName: 'Abebe',
    };

    await expect(CreateCredit(input, mockSession, mockLogger)).rejects.toThrow('Stock item not found.');
  });

  it('should throw an error if available inventory is insufficient', async () => {
    mockTx.stock.findUnique.mockResolvedValueOnce({
      id: 'stock-1',
      quantity: 2,
      products: { name: 'Laptop' },
    });

    const input = {
      stockId: 'stock-1',
      quantity: 5,
      totalAmount: 10000,
      customerName: 'Abebe',
    };

    await expect(CreateCredit(input, mockSession, mockLogger)).rejects.toThrow(
      'Insufficient inventory. Requested: 5, Available: 2'
    );
  });

  it('should create credit, update stock, create transaction and audit log on success', async () => {
    const mockStock = {
      id: 'stock-1',
      quantity: 10,
      serialNumber: 'SN12345',
      products: { name: 'Laptop', warrantyDays: 365 },
    };

    mockTx.stock.findUnique.mockResolvedValueOnce(mockStock);
    mockTx.stock.update.mockResolvedValueOnce({ id: 'stock-1', quantity: 8 });
    mockTx.transaction.create.mockResolvedValueOnce({ id: 'tx-1', invoiceNumber: 'CRD-CODE123' });
    mockTx.credit.create.mockResolvedValueOnce({
      id: 'crd-1',
      customerName: 'Abebe',
      totalAmount: 10000,
      status: 'PENDING',
    });
    mockTx.log.create.mockResolvedValueOnce({ id: 'log-1' });

    const input = {
      stockId: 'stock-1',
      quantity: 2,
      totalAmount: 10000,
      customerName: 'Abebe',
      customerPhone: '+251900000000',
      customerIdDoc: 'DOC-123',
      dueDate: '2026-12-31T00:00:00.000Z',
    };

    const result = await CreateCredit(input, mockSession, mockLogger);

    expect(result).toHaveProperty('id', 'crd-1');

    // 1. Stock update
    expect(mockTx.stock.update).toHaveBeenCalledWith({
      where: { id: 'stock-1' },
      data: { quantity: { decrement: 2 } },
    });

    // 2. Transaction creation
    expect(mockTx.transaction.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        invoiceNumber: 'CRD-CODE123',
        type: 'SOLD',
        quantity: 2,
        price: 10000,
        paymentMethod: 'CREDIT',
        customerName: 'Abebe',
        customerPhone: '+251900000000',
        stockId: 'stock-1',
        userId: 'user-1',
      }),
    });

    // 3. Credit creation
    expect(mockTx.credit.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        customerName: 'Abebe',
        customerPhone: '+251900000000',
        customerIdDoc: 'DOC-123',
        quantity: 2,
        totalAmount: 10000,
        status: 'PENDING',
        stockId: 'stock-1',
        transactionId: 'tx-1',
        createdById: 'user-1',
      }),
      include: expect.any(Object),
    });

    // 4. Audit Log
    expect(mockTx.log.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: 'CREDIT_ISSUED',
        severity: 'INFO',
        userId: 'user-1',
        targetId: 'crd-1',
      }),
    });

    expect(mockLogger.info).toHaveBeenCalledWith({ creditId: 'crd-1' }, 'Credit issued successfully');
  });
});
