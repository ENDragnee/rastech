import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateUser } from '../services/create-user.service';
import { ISession } from '@/types/next-auth';
import { Logger } from 'pino';
import { NextResponse } from 'next/server';

const { mockTx, mockPrisma, mockHashPassword } = vi.hoisted(() => {
  const tx = {
    user: { create: vi.fn() },
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

describe('CreateUserService', () => {
  let mockLogger: Logger;
  let session: ISession;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() } as unknown as Logger;
    session = { id: 'admin-id', userName: 'admin' } as ISession;
  });

  it('should create a user and log it', async () => {
    mockHashPassword.mockResolvedValue('hashed-pwd');
    const userData = { id: 'user-1', userName: 'testuser' };
    mockTx.user.create.mockResolvedValue(userData);

    const result = await CreateUser({ userName: 'testuser', passowrd: 'pwd123', isActive: true, name: 'Test' }, session, mockLogger);

    expect(mockHashPassword).toHaveBeenCalledWith('pwd123');
    expect(mockTx.user.create).toHaveBeenCalledWith({
      data: { name: 'Test', userName: 'testuser', password: 'hashed-pwd', isActive: true }
    });
    expect(mockTx.log.create).toHaveBeenCalledWith({
      data: {
        type: 'USER_CREATE',
        severity: 'INFO',
        message: 'User admin-id has created a user',
        userId: 'admin-id'
      }
    });
    expect(result).toEqual(userData);
  });

  it('should return 500 if hashing fails', async () => {
    mockHashPassword.mockResolvedValue(null);
    const result = await CreateUser({ userName: 't', passowrd: 'p' }, session, mockLogger);
    expect(result).toBeInstanceOf(NextResponse);
    expect(result.status).toBe(500);
  });

  it('should return 400 on unique constraint violation (P2002)', async () => {
    mockHashPassword.mockResolvedValue('hashed');
    const error: any = new Error('Unique constraint');
    error.code = 'P2002';
    mockPrisma.$transaction.mockRejectedValue(error);

    const result = await CreateUser({ userName: 'existing', passowrd: 'pwd' }, session, mockLogger);
    expect(result).toBeInstanceOf(NextResponse);
    expect(result.status).toBe(400);
  });

  it('should throw on other errors', async () => {
    mockHashPassword.mockResolvedValue('hashed');
    const error = new Error('Other error');
    mockPrisma.$transaction.mockRejectedValue(error);

    await expect(CreateUser({ userName: 'u', passowrd: 'p' }, session, mockLogger)).rejects.toThrow('Other error');
  });
});
