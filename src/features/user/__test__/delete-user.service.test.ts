import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteUser } from '../services/delete-user.service';
import { ISession } from '@/types/next-auth';
import { Logger } from 'pino';
import { NextResponse } from 'next/server';

const { mockTx, mockPrisma } = vi.hoisted(() => {
  const tx = {
    user: { update: vi.fn() },
    log: { create: vi.fn() },
  };
  return { mockTx: tx, mockPrisma: { $transaction: vi.fn((cb) => cb(tx)) } };
});

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));

describe('DeleteUserService', () => {
  let mockLogger: Logger;
  let session: ISession;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() } as unknown as Logger;
    session = { id: 'admin-1', userName: 'admin' } as ISession;
  });

  it('should deactivate user and log it', async () => {
    const userData = { id: 'user-1', userName: 'testuser', name: 'Test' };
    mockTx.user.update.mockResolvedValue(userData);

    const result = await DeleteUser(session, { id: 'user-1' }, mockLogger);

    expect(mockTx.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { isActive: false }
    });
    expect(mockTx.log.create).toHaveBeenCalledWith({
      data: {
        type: 'USER_DEACTIVATED',
        severity: 'INFO',
        message: 'Admin @admin deactivated user @testuser',
        userId: 'admin-1',
        targetId: 'user-1',
        targetName: 'Test'
      }
    });
    expect(result).toEqual(userData);
  });

  it('should return 400 if user id is missing', async () => {
    const result = await DeleteUser(session, undefined, mockLogger);
    expect(result).toBeInstanceOf(NextResponse);
    expect(result.status).toBe(400);
  });
});
