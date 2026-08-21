import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FetchCategories } from '../services/fetch-categories.service';

const { mockPrisma } = vi.hoisted(() => {
  return { mockPrisma: { category: { findMany: vi.fn() } } };
});

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));

describe('FetchCategories Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch categories successfully', async () => {
    const mockCategories = [{ id: 'cat-1', name: 'Electronics' }];
    mockPrisma.category.findMany.mockResolvedValueOnce(mockCategories);

    const result = await FetchCategories();

    expect(mockPrisma.category.findMany).toHaveBeenCalled();
    expect(result).toEqual(mockCategories);
  });

  it('should rethrow errors from prisma', async () => {
    const error = new Error('DB Error');
    mockPrisma.category.findMany.mockRejectedValueOnce(error);

    await expect(FetchCategories()).rejects.toThrow('DB Error');
  });
});
