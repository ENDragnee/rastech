import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FetchRoles } from '../services/fetch-roles.service';

const { mockPrisma } = vi.hoisted(() => {
  return { 
    mockPrisma: { 
      $transaction: vi.fn(),
      role: { findMany: vi.fn(), count: vi.fn() }
    } 
  };
});

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));

describe('FetchRolesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch roles with pagination and search', async () => {
    const mockRoles = [{ id: '1', name: 'Admin' }];
    mockPrisma.$transaction.mockResolvedValue([mockRoles, 1]);

    const req = { page: 1, limit: 10, order: 'desc' as const, sort: 'createdAt' as const, search: 'Adm' };
    const result = await FetchRoles(req);

    expect(mockPrisma.$transaction).toHaveBeenCalled();
    expect(result.data).toEqual(mockRoles);
    expect(result.meta).toEqual({
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    });
  });

  it('should fetch roles without search', async () => {
    mockPrisma.$transaction.mockResolvedValue([[], 0]);
    const req = { page: 2, limit: 10, order: 'asc' as const, sort: 'name' as const };
    const result = await FetchRoles(req);
    expect(result.meta.page).toBe(2);
    expect(result.meta.hasPrev).toBe(true);
  });

  it('should propagate errors', async () => {
    mockPrisma.$transaction.mockRejectedValue(new Error('DB Error'));
    const req = { page: 1, limit: 10, order: 'asc' as const, sort: 'name' as const };
    await expect(FetchRoles(req)).rejects.toThrow('DB Error');
  });
});
