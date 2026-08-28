import { describe, it, expect } from 'vitest';
import { CreateCreditSchema, UpdateCreditSchema, FetchCreditSchema } from '../schemas/credit.schema';

describe('Credit Schemas', () => {
  describe('CreateCreditSchema', () => {
    it('should validate valid credit input', () => {
      const input = {
        stockId: 'stock-1',
        quantity: 2,
        totalAmount: 1500,
        customerName: 'Abebe Bikila',
        customerPhone: '+251911223344',
        customerIdDoc: 'ID-9988',
        dueDate: new Date().toISOString(),
      };
      const result = CreateCreditSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should validate minimal valid credit input', () => {
      const input = {
        stockId: 'stock-1',
        quantity: 1,
        totalAmount: 500,
        customerName: 'Kebede',
      };
      const result = CreateCreditSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should invalidate when stockId is missing', () => {
      const input = {
        quantity: 1,
        totalAmount: 500,
        customerName: 'Kebede',
      };
      const result = CreateCreditSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should invalidate non-positive quantity', () => {
      const input = {
        stockId: 'stock-1',
        quantity: 0,
        totalAmount: 500,
        customerName: 'Kebede',
      };
      const result = CreateCreditSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should invalidate negative total amount', () => {
      const input = {
        stockId: 'stock-1',
        quantity: 1,
        totalAmount: -10,
        customerName: 'Kebede',
      };
      const result = CreateCreditSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should invalidate empty customer name', () => {
      const input = {
        stockId: 'stock-1',
        quantity: 1,
        totalAmount: 500,
        customerName: '   ',
      };
      const result = CreateCreditSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('UpdateCreditSchema', () => {
    it('should validate valid status enum values', () => {
      ['PENDING', 'PAID', 'RETURNED', 'DEFAULTED'].forEach((status) => {
        const result = UpdateCreditSchema.safeParse({ status });
        expect(result.success).toBe(true);
      });
    });

    it('should invalidate invalid status', () => {
      const result = UpdateCreditSchema.safeParse({ status: 'CANCELLED' });
      expect(result.success).toBe(false);
    });
  });

  describe('FetchCreditSchema', () => {
    it('should set default pagination values', () => {
      const result = FetchCreditSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.order).toBe('desc');
      expect(result.sort).toBe('createdAt');
    });

    it('should validate filters', () => {
      const input = {
        page: 2,
        limit: 20,
        order: 'asc',
        sort: 'totalAmount',
        search: 'Abebe',
        status: 'PENDING',
        overdueOnly: 'true',
      };
      const result = FetchCreditSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });
});
