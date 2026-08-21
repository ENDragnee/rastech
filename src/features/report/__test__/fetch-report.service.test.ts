import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FetchReportData } from '../services/fetch-report.service';
import { prisma } from '@/lib/prisma';
import { FetchReportInput } from '../schemas/report.schema';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    stock: { findMany: vi.fn() },
    transaction: { findMany: vi.fn() },
  },
}));

describe('FetchReportData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle STOCK_STATUS report', async () => {
    vi.mocked(prisma.stock.findMany).mockResolvedValue([
      {
        id: 's1',
        quantity: 10,
        costPrice: 100,
        sellingPrice: 150,
        serialNumber: 'SN123',
        products: { name: 'Product A', category: { name: 'Cat A' } },
      } as any,
    ]);

    const req: FetchReportInput = { type: 'STOCK_STATUS' };
    const result = await FetchReportData(req);

    expect(result.type).toBe('STOCK_STATUS');
    expect(result.summary.totalUnits).toBe(10);
    expect(result.summary.totalCostValue).toBe(1000);
    expect(result.summary.totalPotentialValue).toBe(1500);
    expect(result.summary.projectedProfit).toBe(500);
    expect(result.rows).toHaveLength(1);
  });

  it('should handle SALES_SUMMARY report', async () => {
    vi.mocked(prisma.transaction.findMany).mockResolvedValue([
      {
        id: 't1',
        type: 'SOLD',
        quantity: 2,
        price: 300,
        stocks: { costPrice: 100, products: { name: 'Product B' } },
        users: { userName: 'user1' },
      } as any,
    ]);

    const req: FetchReportInput = { type: 'SALES_SUMMARY', categoryId: 'cat1', startDate: '2024-01-01', endDate: '2024-12-31' };
    const result = await FetchReportData(req);

    expect(result.type).toBe('SALES_SUMMARY');
    expect(result.summary.totalRevenue).toBe(300);
    expect(result.summary.totalCost).toBe(200);
    expect(result.summary.grossProfit).toBe(100);
    expect(result.summary.marginPercent).toBeCloseTo(33.33, 1);
    expect(result.rows).toHaveLength(1);
  });
  
  it('should safely handle division by zero in SALES_SUMMARY', async () => {
    vi.mocked(prisma.transaction.findMany).mockResolvedValue([]);
    const req: FetchReportInput = { type: 'SALES_SUMMARY' };
    const result = await FetchReportData(req);
    expect(result.summary.marginPercent).toBe(0);
  });

  it('should handle DEFECTS_LOSSES report', async () => {
    vi.mocked(prisma.transaction.findMany).mockResolvedValue([
      {
        id: 't2',
        type: 'DEFECTIVE',
        quantity: 1,
        stocks: { costPrice: 100, products: { name: 'Product C' } },
      } as any,
      {
        id: 't3',
        type: 'ADJUSTMENT_LOSS',
        quantity: 2,
        stocks: { costPrice: 50, products: { name: 'Product D' } },
      } as any,
      {
        id: 't4',
        type: 'RETURNED',
        quantity: 1,
        stocks: { costPrice: 100, products: { name: 'Product C' } },
      } as any,
    ]);

    const req: FetchReportInput = { type: 'DEFECTS_LOSSES', startDate: '2024-01-01' };
    const result = await FetchReportData(req);

    expect(result.type).toBe('DEFECTS_LOSSES');
    expect(result.summary.totalLossValue).toBe(200);
    expect(result.summary.defectCount).toBe(1);
    expect(result.summary.shrinkageCount).toBe(1);
    expect(result.summary.returnCount).toBe(1);
    expect(result.rows).toHaveLength(3);
  });

  it('should handle TAX_VAT report', async () => {
    vi.mocked(prisma.transaction.findMany).mockResolvedValue([
      {
        id: 't5',
        type: 'SOLD',
        price: 115,
        stocks: { withVat: true, products: { name: 'Product E' } },
      } as any,
      {
        id: 't6',
        type: 'SOLD',
        price: 100,
        stocks: { withVat: false, products: { name: 'Product F' } },
      } as any,
    ]);

    const req: FetchReportInput = { type: 'TAX_VAT', endDate: '2024-12-31' };
    const result = await FetchReportData(req);

    expect(result.type).toBe('TAX_VAT');
    expect(result.summary.totalGrossSales).toBe(215);
    expect(result.summary.totalVatGross).toBe(115);
    expect(result.summary.totalNonVatGross).toBe(100);
    expect(result.summary.totalVatLiability).toBeCloseTo(15);
    expect(result.summary.netTaxableRevenue).toBe(100);
    expect(result.rows).toHaveLength(2);
  });

  it('should handle WARRANTY_RMA report', async () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);

    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 1);

    vi.mocked(prisma.transaction.findMany).mockResolvedValue([
      {
        id: 't7',
        type: 'SOLD',
        warrantyEndsAt: futureDate,
        stocks: { products: { name: 'Product G' } },
      } as any,
      {
        id: 't8',
        type: 'SOLD',
        warrantyEndsAt: pastDate,
        stocks: { products: { name: 'Product H' } },
      } as any,
    ]);

    const req: FetchReportInput = { type: 'WARRANTY_RMA' };
    const result = await FetchReportData(req);

    expect(result.type).toBe('WARRANTY_RMA');
    expect(result.summary.activeCount).toBe(1);
    expect(result.summary.expiredCount).toBe(1);
    expect(result.rows).toHaveLength(2);
  });
  
  it('should handle ALL categoryId', async () => {
    vi.mocked(prisma.stock.findMany).mockResolvedValue([]);
    const req: FetchReportInput = { type: 'STOCK_STATUS', categoryId: 'ALL' };
    await FetchReportData(req);
    expect(prisma.stock.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { products: {} }
    }));
  });
});
