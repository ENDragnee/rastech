import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateUser } from '../services/update-user.service';
import { ISession } from '@/types/next-auth';
import { Logger } from 'pino';
import { NextResponse } from 'next/server';

const { mockTx, mockPrisma, mockHashPassword } = vi.hoisted(() => {
  const tx = {
    user: { update: vi.fn() },
    role: { findMany: vi.fn() },
    log: { create: vi.fn() },
  };
  return { 
    mockTx: tx, 
    mockPrisma: { $transaction: vi.fn((cb) => cb(tx)) },
    mockHashPassword: vi.fn()
  };
});

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));
vi.mock('@/lib/password-utils', () => ({ HashPassword: mockHashPassword }));

describe('UpdateUserService', () => {
  let mockLogger: Logger;
  let session: ISession;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() } as unknown as Logger;
    session = { id: 'admin-1', userName: 'admin' } as ISession;
  });

  it('should return 400 if id is missing', async () => {
    const result = await UpdateUser({}, session, undefined, mockLogger);
    expect(result).toBeInstanceOf(NextResponse);
    expect(result.status).toBe(400);
  });

  it('should update user roles and permissions', async () => {
    const mockRoles = [
      { id: 'r1', name: 'Role 1', permissions: [{ id: 'p1' }, { id: 'p2' }] },
      { id: 'r2', name: 'Role 2', permissions: [{ id: 'p2' }, { id: 'p3' }] }
    ];
    mockTx.role.findMany.mockResolvedValue(mockRoles);
    
    const mockUser = { id: 'u1', userName: 'testuser', name: 'Test', roles: [{ name: 'Role 1' }] };
    mockTx.user.update.mockResolvedValue(mockUser);

    const result = await UpdateUser({ roleIds: ['r1', 'r2'] }, session, { id: 'u1' }, mockLogger);

    expect(mockTx.role.findMany).toHaveBeenCalledWith({
      where: { id: { in: ['r1', 'r2'] } },
      include: { permissions: true }
    });

    expect(mockTx.user.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'u1' },
      data: expect.objectContaining({
        roles: { set: [{ id: 'r1' }, { id: 'r2' }] },
        permissions: { set: [{ id: 'p1' }, { id: 'p2' }, { id: 'p3' }] }
      })
    }));

    expect(mockTx.log.create).toHaveBeenCalled();
    expect(result).toEqual(mockUser);
  });

  it('should update password and basic info', async () => {
    mockHashPassword.mockResolvedValue('new-hash');
    mockTx.user.update.mockResolvedValue({ id: 'u1', userName: 'newname', roles: [] });

    await UpdateUser({ userName: 'newname', passowrd: 'newpwd123', isActive: false }, session, { id: 'u1' }, mockLogger);

    expect(mockHashPassword).toHaveBeenCalledWith('newpwd123');
    expect(mockTx.user.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        userName: 'newname',
        password: 'new-hash',
        isActive: false
      })
    }));
  });

  it('should handle P2002 error', async () => {
    const error: any = new Error('Unique constraint');
    error.code = 'P2002';
    mockPrisma.$transaction.mockRejectedValue(error);

    const result = await UpdateUser({ userName: 'existing' }, session, { id: 'u1' }, mockLogger);
    expect(result).toBeInstanceOf(NextResponse);
    expect(result.status).toBe(400);
  });
});
