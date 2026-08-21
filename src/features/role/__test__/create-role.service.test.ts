import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateRole } from '../services/create-role.service';
import { ISession } from '@/types/next-auth';
import { Logger } from 'pino';

const { mockTx, mockPrisma } = vi.hoisted(() => {
  const tx = {
    role: { create: vi.fn() },
    log: { create: vi.fn() },
  };
  return { mockTx: tx, mockPrisma: { $transaction: vi.fn((cb) => cb(tx)) } };
});

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));

describe('CreateRoleService', () => {
  let mockLogger: Logger;
  let session: ISession;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() } as unknown as Logger;
    session = { id: 'user-id', userName: 'Test User' } as ISession;
  });

  it('should create a role with permissions', async () => {
    const roleData = { id: 'role-id', name: 'Admin', guardName: 'web' };
    mockTx.role.create.mockResolvedValue(roleData);

    const result = await CreateRole({ name: 'Admin', guardName: 'web', permissions: ['perm1'] }, session, mockLogger);

    expect(mockPrisma.$transaction).toHaveBeenCalled();
    expect(mockTx.role.create).toHaveBeenCalledWith({
      data: {
        name: 'Admin',
        guardName: 'web',
        permissions: { connect: [{ id: 'perm1' }] }
      }
    });
    expect(mockTx.log.create).toHaveBeenCalledWith({
      data: {
        type: 'CREATED_ROLE',
        severity: 'INFO',
        message: 'User: user-id created role Admin',
        userId: 'user-id'
      }
    });
    expect(mockLogger.info).toHaveBeenCalledWith({ roleId: 'role-id' }, 'Role created successfully');
    expect(result).toEqual(roleData);
  });

  it('should create a role without permissions', async () => {
    const roleData = { id: 'role-id', name: 'User', guardName: 'web' };
    mockTx.role.create.mockResolvedValue(roleData);

    const result = await CreateRole({ name: 'User', guardName: 'web' }, session, mockLogger);

    expect(mockTx.role.create).toHaveBeenCalledWith({
      data: {
        name: 'User',
        guardName: 'web',
        permissions: undefined
      }
    });
    expect(result).toEqual(roleData);
  });
});
