import { describe, it, expect } from 'vitest';
import { CreateTransactionSchema, FetchTransactionSchema } from '../schemas/transaction.schema';

describe('transaction.schema', () => {
  describe('CreateTransactionSchema', () => {
    const validInput = {
      type: 'SOLD',
      stockId: 'stock-123',
      quantity: 5,
      price: 1500,
      paymentMethod: 'CASH',
    };

    it('should validate correct payload', () => {
      const result = CreateTransactionSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should invalidate if type is invalid', () => {
      const result = CreateTransactionSchema.safeParse({
        ...validInput,
        type: 'INVALID_TYPE',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues?.[0]?.message).toBeDefined();
      }
    });

    it('should invalidate if quantity is 0 or negative', () => {
      const payload = {
        type: 'SOLD',
        stockId: 'stock-123',
        quantity: 0,
        price: 1500,
      };
      const result = CreateTransactionSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe('FetchTransactionSchema', () => {
    it('should validate with default values', () => {
      const result = FetchTransactionSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
        expect(result.data.order).toBe('desc');
        expect(result.data.sort).toBe('createdAt');
      }
    });

    it('should validate correct overrides', () => {
      const payload = {
        page: 2,
        limit: 50,
        order: 'asc',
        sort: 'price',
        search: 'INV-123',
        type: 'SOLD',
      };
      const result = FetchTransactionSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });
  });
});
