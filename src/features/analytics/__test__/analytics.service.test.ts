import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetDashboardAnalytics } from '../services/analytics.service';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => {
  return {
    prisma: {
      product: { findMany: vi.fn() },
      transaction: { findMany: vi.fn() },
    },
  };
});

describe('GetDashboardAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should compute analytics data correctly for WEEK', async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([
      {
        id: 'p1',
        name: 'Product 1',
        sku: 'SKU1',
        category: { id: 'c1', name: 'Cat 1' },
        stocks: [
          { id: 's1', productId: 'p1', quantity: 10, costPrice: 100, sellingPrice: 150 },
        ],
      } as any,
    ]);

    vi.mocked(prisma.transaction.findMany).mockImplementation(async (args: any) => {
      if (args?.where?.type === 'SOLD') {
        return [
          {
            id: 't1',
            type: 'SOLD',
            createdAt: new Date(),
            price: 150,
            quantity: 1,
            stocks: { costPrice: 100, productId: 'p1', products: { category: { id: 'c1', name: 'Cat 1' } } },
          } as any,
        ];
      }
      if (args?.where?.OR) {
        return [
          {
            id: 't2',
            type: 'DEFECTIVE',
            createdAt: new Date(),
            quantity: 1,
            stocks: { costPrice: 100 },
          } as any,
          {
            id: 't3',
            type: 'ADJUSTMENT_LOSS',
            createdAt: new Date(),
            quantity: 1,
            stocks: { costPrice: 50 },
          } as any,
        ];
      }
      return [];
    });

    const result = await GetDashboardAnalytics('WEEK');
    expect(result.performance.totalRevenue).toBe(150);
    expect(result.performance.totalCostOfSold).toBe(100);
    expect(result.performance.grossProfit).toBe(50);
    expect(result.health.turnoverRate).toBe(0.1);
    expect(result.categorySales).toHaveLength(1);
    expect(result.timeline).toHaveLength(7);
    expect(result.defectMetrics.defectCount).toBe(1);
    expect(result.defectMetrics.adjustmentLossCount).toBe(1);
  });

  it('should handle MONTH timeframe', async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([]);
    vi.mocked(prisma.transaction.findMany).mockResolvedValue([]);

    const result = await GetDashboardAnalytics('MONTH');
    expect(result.timeline).toHaveLength(30);
  });

  it('should handle YEAR timeframe', async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([]);
    vi.mocked(prisma.transaction.findMany).mockResolvedValue([]);

    const result = await GetDashboardAnalytics('YEAR');
    expect(result.timeline).toHaveLength(12);
  });
  
  it('should identify dead stock, low stock, out of stock, zero stats', async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([
      {
        id: 'p1', stocks: [{ quantity: 0, costPrice: 10, sellingPrice: 15 }]
      } as any,
      {
        id: 'p2', stocks: [{ quantity: 3, costPrice: 10, sellingPrice: 15 }]
      } as any,
      {
        id: 'p3', stocks: [{ quantity: 25, costPrice: 10, sellingPrice: 15 }]
      } as any,
      {
        id: 'p4', stocks: [{ quantity: 10, costPrice: 10, sellingPrice: 15 }]
      } as any,
    ]);
    vi.mocked(prisma.transaction.findMany).mockResolvedValue([
      { type: 'SOLD', quantity: 1, price: 15, createdAt: new Date(), stocks: { productId: 'p1' } } as any,
    ]);
    
    const result = await GetDashboardAnalytics('WEEK');
    
    const p1 = result.itemPerformance.find((p: any) => p.productId === 'p1');
    expect(p1?.status).toBe('OUT_OF_STOCK');
    
    const p2 = result.itemPerformance.find((p: any) => p.productId === 'p2');
    expect(p2?.status).toBe('LOW_STOCK');
    
    const p3 = result.itemPerformance.find((p: any) => p.productId === 'p3');
    expect(p3?.status).toBe('DEAD_STOCK');

    const p4 = result.itemPerformance.find((p: any) => p.productId === 'p4');
    expect(p4?.status).toBe('HEALTHY');
  });

  it('should safely handle division by zero in financial stats', async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([]);
    vi.mocked(prisma.transaction.findMany).mockResolvedValue([]);

    const result = await GetDashboardAnalytics('WEEK');
    expect(result.performance.grossMarginPercentage).toBe(0);
    expect(result.performance.roi).toBe(0);
    expect(result.health.turnoverRate).toBe(0);
    expect(result.health.stockToSalesRatio).toBe(0);
  });
});
