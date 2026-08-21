import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteCategory } from '../services/delete-catagory.service';
import { NextResponse } from 'next/server';

const { mockTx, mockPrisma } = vi.hoisted(() => {
  const tx = {
    log: { create: vi.fn() },
    category: { delete: vi.fn() },
  };
  return { mockTx: tx, mockPrisma: { $transaction: vi.fn((cb) => cb(tx)) } };
});

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({ data, options })),
  },
}));

describe('DeleteCategory Service', () => {
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

  it('should delete a category successfully', async () => {
    await DeleteCategory(mockSession, { id: 'cat-1' }, mockLogger);

    expect(mockTx.category.delete).toHaveBeenCalledWith({ where: { id: 'cat-1' } });
    expect(mockTx.log.create).toHaveBeenCalledWith({
      data: {
        type: 'CATEGORY_DELETED',
        severity: 'INFO',
        message: 'User testuser has deleted category cat-1',
        userId: 'user-123',
      },
    });

    expect(mockLogger.info).toHaveBeenCalledWith({ id: 'cat-1' }, 'Category deleted successfully');
  });

  it('should return error response if id is missing', async () => {
    const result = await DeleteCategory(mockSession, undefined, mockLogger);

    expect(mockLogger.warn).toHaveBeenCalledWith('Delete category requested without a category ID');
    expect(NextResponse.json).toHaveBeenCalledWith({ error: 'Category ID required' }, { status: 400 });
    expect(result).toEqual({ data: { error: 'Category ID required' }, options: { status: 400 } });
  });

  it('should rethrow errors from prisma', async () => {
    const error = new Error('DB Error');
    mockPrisma.$transaction.mockRejectedValueOnce(error);

    await expect(DeleteCategory(mockSession, { id: 'cat-1' }, mockLogger)).rejects.toThrow('DB Error');
  });
});
