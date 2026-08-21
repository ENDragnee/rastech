import { describe, it, expect } from 'vitest';
import { FetchReportSchema, ReportTypeEnum } from '../schemas/report.schema';

describe('Report Schema', () => {
  it('should validate ReportTypeEnum', () => {
    expect(ReportTypeEnum.parse('STOCK_STATUS')).toBe('STOCK_STATUS');
    expect(ReportTypeEnum.parse('SALES_SUMMARY')).toBe('SALES_SUMMARY');
    expect(ReportTypeEnum.parse('DEFECTS_LOSSES')).toBe('DEFECTS_LOSSES');
    expect(ReportTypeEnum.parse('TAX_VAT')).toBe('TAX_VAT');
    expect(ReportTypeEnum.parse('WARRANTY_RMA')).toBe('WARRANTY_RMA');
    expect(() => ReportTypeEnum.parse('INVALID')).toThrow();
  });

  it('should validate FetchReportSchema with default type', () => {
    const result = FetchReportSchema.parse({});
    expect(result.type).toBe('STOCK_STATUS');
  });

  it('should validate FetchReportSchema with full input', () => {
    const input = {
      type: 'SALES_SUMMARY',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      categoryId: 'cat1',
    };
    const result = FetchReportSchema.parse(input);
    expect(result).toEqual(input);
  });
});
