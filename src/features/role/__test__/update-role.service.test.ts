import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateRole } from '../services/update-role.service';
import { ISession } from '@/types/next-auth';
import { Logger } from 'pino';
import { NextResponse } from 'next/server';

const { mockTx, mockPrisma } = vi.hoisted(() => {
  const tx = {
    role: { update: vi.fn() },
    log: { create: vi.fn() },
  };
  return { mockTx: tx, mockPrisma: { $transaction: vi.fn((cb) => cb(tx)) } };
});

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));

describe('UpdateRoleService', () => {
  let mockLogger: Logger;
  let session: ISession;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() } as unknown as Logger;
    session = { id: 'user-id', userName: 'Test User' } as ISession;
  });

  it('should return 400 error if id is missing', async () => {
    const result = await UpdateRole({}, session, undefined, mockLogger);
    expect(mockLogger.warn).toHaveBeenCalledWith('Update role requested without a role ID');
    expect(result).toBeInstanceOf(NextResponse);
    expect(result.status).toBe(400);
  });

  it('should update role fields and log action', async () => {
    const roleData = { id: 'role-1', name: 'New Admin' };
    mockTx.role.update.mockResolvedValue(roleData);

    const result = await UpdateRole({ name: 'New Admin', permissions: ['p1'] }, session, { id: 'role-1' }, mockLogger);

    expect(mockPrisma.$transaction).toHaveBeenCalled();
    expect(mockTx.log.create).toHaveBeenCalledWith({
      data: {
        type: 'UPDATED_ROLE',
        severity: 'INFO',
        message: 'User: user-id updated role role-1',
        userId: 'user-id'
      }
    });
    expect(mockTx.role.update).toHaveBeenCalledWith({
      where: { id: 'role-1' },
      data: {
        name: 'New Admin',
        permissions: { set: [{ id: 'p1' }] }
      }
    });
    expect(mockLogger.info).toHaveBeenCalledWith({ id: 'role-1' }, 'Updated role successfully');
    expect(result).toEqual(roleData);
  });

  it('should allow partial update', async () => {
    const roleData = { id: 'role-1' };
    mockTx.role.update.mockResolvedValue(roleData);

    const result = await UpdateRole({ guardName: 'api' }, session, { id: 'role-1' }, mockLogger);
    
    expect(mockTx.role.update).toHaveBeenCalledWith({
      where: { id: 'role-1' },
      data: {
        guardName: 'api'
      }
    });
    expect(result).toEqual(roleData);
  });
});
