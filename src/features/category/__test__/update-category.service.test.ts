import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateCategory } from '../services/update-category.service';
import { NextResponse } from 'next/server';

const { mockTx, mockPrisma } = vi.hoisted(() => {
  const tx = {
    log: { create: vi.fn() },
    category: { update: vi.fn() },
  };
  return { mockTx: tx, mockPrisma: { $transaction: vi.fn((cb) => cb(tx)) } };
});

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({ data, options })),
  },
}));

describe('UpdateCategory Service', () => {
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

  it('should update a category successfully with name and description', async () => {
    mockTx.category.update.mockResolvedValueOnce({ id: 'cat-1', name: 'Electronics Updated' });

    const result = await UpdateCategory(
      { name: 'Electronics Updated', description: 'New desc' },
      mockSession,
      { id: 'cat-1' },
      mockLogger
    );

    expect(mockTx.log.create).toHaveBeenCalledWith({
      data: {
        type: 'CATEGORY_UPDATED',
        severity: 'INFO',
        message: 'User testuser has updated category cat-1',
        userId: 'user-123',
      },
    });

    expect(mockTx.category.update).toHaveBeenCalledWith({
      where: { id: 'cat-1' },
      data: {
        name: 'Electronics Updated',
        description: 'New desc',
      },
    });

    expect(mockLogger.info).toHaveBeenCalledWith({ id: 'cat-1' }, 'Category updated successfully');
    expect(result).toEqual({ id: 'cat-1', name: 'Electronics Updated' });
  });

  it('should update a category successfully with only name', async () => {
    mockTx.category.update.mockResolvedValueOnce({ id: 'cat-1', name: 'Electronics Updated' });

    const result = await UpdateCategory(
      { name: 'Electronics Updated' },
      mockSession,
      { id: 'cat-1' },
      mockLogger
    );

    expect(mockTx.category.update).toHaveBeenCalledWith({
      where: { id: 'cat-1' },
      data: {
        name: 'Electronics Updated',
      },
    });
    expect(result).toEqual({ id: 'cat-1', name: 'Electronics Updated' });
  });

  it('should return error response if id is missing', async () => {
    const result = await UpdateCategory({ name: 'Fail' }, mockSession, undefined, mockLogger);

    expect(mockLogger.warn).toHaveBeenCalledWith('Update category requested without a category ID');
    expect(NextResponse.json).toHaveBeenCalledWith({ error: 'Category ID required' }, { status: 400 });
    expect(result).toEqual({ data: { error: 'Category ID required' }, options: { status: 400 } });
  });

  it('should rethrow errors from prisma', async () => {
    const error = new Error('DB Error');
    mockPrisma.$transaction.mockRejectedValueOnce(error);

    await expect(UpdateCategory({ name: 'Fail' }, mockSession, { id: 'cat-1' }, mockLogger)).rejects.toThrow('DB Error');
  });
});
