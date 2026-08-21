import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CheckSku } from '../services/check-sku.service';
import { NextResponse } from 'next/server';

const { mockPrisma } = vi.hoisted(() => {
  return { mockPrisma: { product: { findUnique: vi.fn() } } };
});

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));
vi.mock('next/server', () => ({
  NextResponse: { json: vi.fn((data, opts) => ({ data, opts })) }
}));

describe('CheckSku Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return available false if sku exists', async () => {
    mockPrisma.product.findUnique.mockResolvedValueOnce({ id: 'p1' });
    await CheckSku({ search: 'sku1' });
    expect(NextResponse.json).toHaveBeenCalledWith({ available: false, message: 'SKU is already in use' }, { status: 200 });
  });

  it('should return available true if sku does not exist', async () => {
    mockPrisma.product.findUnique.mockResolvedValueOnce(null);
    await CheckSku({ search: 'sku1' });
    expect(NextResponse.json).toHaveBeenCalledWith({ available: true, message: 'SKU is available' }, { status: 200 });
  });

  it('should throw on DB error', async () => {
    mockPrisma.product.findUnique.mockRejectedValueOnce(new Error('DB failure'));
    await expect(CheckSku({ search: 'sku1' })).rejects.toThrow('DB failure');
  });
});
