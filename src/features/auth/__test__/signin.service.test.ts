import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserNameSignIn } from '../services/sigin.service';
import { ValidatePassword } from '@/lib/password-utils';

const { mockTx, mockPrisma } = vi.hoisted(() => {
  const tx = {
    log: { create: vi.fn() },
    user: { findUnique: vi.fn() },
  };
  return { mockTx: tx, mockPrisma: tx };
});

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));
vi.mock('@/lib/password-utils', () => ({ ValidatePassword: vi.fn() }));
vi.mock('@/lib/logger', () => ({
  logger: {
    child: vi.fn(() => ({
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
    })),
  },
}));

describe('UserNameSignIn Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should sign in successfully with valid credentials', async () => {
    const mockUser = {
      id: 'user-1',
      name: 'John Doe',
      userName: 'johndoe',
      password: 'hashedpassword',
      roles: [{ name: 'ADMIN' }],
      permissions: [{ name: 'READ' }, { name: 'WRITE' }],
    };
    mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser);
    (ValidatePassword as any).mockResolvedValueOnce(true);
    mockPrisma.log.create.mockResolvedValueOnce({});

    const result = await UserNameSignIn({ userName: 'johndoe', password: 'password123' });

    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { userName: 'johndoe' },
      include: { roles: true, permissions: true },
    });
    expect(ValidatePassword).toHaveBeenCalledWith('password123', 'hashedpassword');
    expect(mockPrisma.log.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ type: 'AUTH_LOGIN_SUCCESS', userId: 'user-1' })
    }));

    expect(result).toEqual({
      id: 'user-1',
      name: 'John Doe',
      userName: 'johndoe',
      role: ['ADMIN'],
      permissions: ['READ', 'WRITE'],
    });
  });

  it('should throw error if credentials are missing', async () => {
    await expect(UserNameSignIn(undefined)).rejects.toThrow('Missing credentials');
    await expect(UserNameSignIn({ userName: 'user', password: '' })).rejects.toThrow('Missing credentials');
  });

  it('should throw error if user not found', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);

    await expect(UserNameSignIn({ userName: 'invalid', password: 'pwd' })).rejects.toThrow('Invalid username or password!');
  });

  it('should throw error if user has no password', async () => {
    const mockUser = { id: 'user-1', password: null };
    mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser);

    await expect(UserNameSignIn({ userName: 'user', password: 'pwd' })).rejects.toThrow('Invalid username or password!');
  });

  it('should log failure and throw error if password is invalid', async () => {
    const mockUser = { id: 'user-1', userName: 'johndoe', password: 'hashedpassword' };
    mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser);
    (ValidatePassword as any).mockResolvedValueOnce(false);
    mockPrisma.log.create.mockResolvedValueOnce({});

    await expect(UserNameSignIn({ userName: 'johndoe', password: 'wrongpassword' })).rejects.toThrow('Invalid username or password!');

    expect(mockPrisma.log.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ type: 'AUTH_LOGIN_FAILED', userId: 'user-1' })
    }));
  });
});
