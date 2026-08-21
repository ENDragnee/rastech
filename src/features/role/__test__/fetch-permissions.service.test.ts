import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FetchModulesWithPermissions } from '../services/fetch-permissions.service';

const { mockPrisma } = vi.hoisted(() => {
  return { 
    mockPrisma: { 
      module: { findMany: vi.fn() }
    } 
  };
});

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));

describe('FetchPermissionsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch modules with permissions', async () => {
    const mockData = [{ id: 'm1', name: 'Module 1', permissions: [] }];
    mockPrisma.module.findMany.mockResolvedValue(mockData);

    const result = await FetchModulesWithPermissions();

    expect(mockPrisma.module.findMany).toHaveBeenCalledWith({
      where: { isActive: true },
      include: {
        permissions: {
          select: { id: true, name: true, guardName: true },
          orderBy: { name: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    });
    expect(result).toEqual(mockData);
  });
});
