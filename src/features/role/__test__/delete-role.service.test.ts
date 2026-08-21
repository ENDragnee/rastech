import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteRole } from '../services/delete-role.service';
import { ISession } from '@/types/next-auth';
import { Logger } from 'pino';
import { NextResponse } from 'next/server';

const { mockTx, mockPrisma } = vi.hoisted(() => {
  const tx = {
    role: { delete: vi.fn() },
    log: { create: vi.fn() },
  };
  return { mockTx: tx, mockPrisma: { $transaction: vi.fn((cb) => cb(tx)) } };
});

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));

describe('DeleteRoleService', () => {
  let mockLogger: Logger;
  let session: ISession;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() } as unknown as Logger;
    session = { id: 'user-id', userName: 'Test User' } as ISession;
  });

  it('should delete a role and log the action', async () => {
    const roleData = { id: 'role-1' };
    mockTx.role.delete.mockResolvedValue(roleData);

    const result = await DeleteRole(session, { id: 'role-1' }, mockLogger);

    expect(mockPrisma.$transaction).toHaveBeenCalled();
    expect(mockTx.role.delete).toHaveBeenCalledWith({ where: { id: 'role-1' } });
    expect(mockTx.log.create).toHaveBeenCalledWith({
      data: {
        type: 'DELETED_ROLE',
        severity: 'WARNING',
        message: 'User: user-id deleted role role-1',
        userId: 'user-id'
      }
    });
    expect(mockLogger.info).toHaveBeenCalledWith({ id: 'role-1' }, 'Deleted role successfully');
    expect(result).toEqual(roleData);
  });

  it('should return 400 error if id is missing', async () => {
    const result = await DeleteRole(session, undefined, mockLogger);
    expect(mockLogger.warn).toHaveBeenCalledWith('Delete role requested without a role ID');
    expect(result).toBeInstanceOf(NextResponse);
    expect(result.status).toBe(400);
  });
});
