import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateCategory } from '../services/create-category.service';
import { NextResponse } from 'next/server';

const { mockTx, mockPrisma } = vi.hoisted(() => {
  const tx = {
    log: { create: vi.fn() },
    category: { create: vi.fn() },
  };
  return { mockTx: tx, mockPrisma: { $transaction: vi.fn((cb) => cb(tx)) } };
});

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({ data, options })),
  },
}));

describe('CreateCategory Service', () => {
  const mockLogger = {
    info: vi.fn(),
    warn: vi.fn(),
  } as any;

  const mockSession = {
    id: 'user-123',
    userName: 'testuser',
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a category successfully', async () => {
    mockTx.category.create.mockResolvedValueOnce({ id: 'cat-1', name: 'Electronics' });

    const result = await CreateCategory({ name: 'Electronics', description: 'Gadgets' }, mockSession, mockLogger);

    expect(mockTx.log.create).toHaveBeenCalledWith({
      data: {
        type: 'CATEGORY_CREATE',
        severity: 'INFO',
        message: 'User user-123 has created category',
        userId: 'user-123',
      },
    });

    expect(mockTx.category.create).toHaveBeenCalledWith({
      data: {
        name: 'Electronics',
        description: 'Gadgets',
      },
    });

    expect(mockLogger.info).toHaveBeenCalledWith({ userName: 'testuser' }, 'Category created successfully');
    expect(result).toEqual({ id: 'cat-1', name: 'Electronics' });
  });

  it('should create a category without description successfully', async () => {
    mockTx.category.create.mockResolvedValueOnce({ id: 'cat-2', name: 'Books' });

    const result = await CreateCategory({ name: 'Books' }, mockSession, mockLogger);

    expect(mockTx.category.create).toHaveBeenCalledWith({
      data: {
        name: 'Books',
      },
    });

    expect(result).toEqual({ id: 'cat-2', name: 'Books' });
  });

  it('should return error response if category name is duplicated (P2002)', async () => {
    const error = new Error('Duplicate');
    (error as any).code = 'P2002';
    mockPrisma.$transaction.mockRejectedValueOnce(error);

    const result = await CreateCategory({ name: 'Duplicate' }, mockSession, mockLogger);

    expect(mockLogger.warn).toHaveBeenCalledWith({ userId: 'user-123' }, 'Duplicate category name request blocked');
    expect(NextResponse.json).toHaveBeenCalledWith({ error: 'The category name is used' }, { status: 400 });
    expect(result).toEqual({ data: { error: 'The category name is used' }, options: { status: 400 } });
  });

  it('should rethrow unknown errors', async () => {
    const error = new Error('Unknown error');
    mockPrisma.$transaction.mockRejectedValueOnce(error);

    await expect(CreateCategory({ name: 'Fail' }, mockSession, mockLogger)).rejects.toThrow('Unknown error');
  });
});
