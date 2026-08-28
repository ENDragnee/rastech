import { describe, it, expect } from 'vitest';
import { CreateSaleSchema, CartItemSchema } from '../schemas/sale.schema';

describe('sale.schema', () => {
  describe('CartItemSchema', () => {
    it('should validate a valid cart item', () => {
      const result = CartItemSchema.safeParse({
        stockId: 'stock-123',
        quantity: 2,
        price: 150.5,
      });
      expect(result.success).toBe(true);
    });

    it('should reject non-positive quantity', () => {
      const result = CartItemSchema.safeParse({
        stockId: 'stock-123',
        quantity: 0,
        price: 150.5,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('CreateSaleSchema', () => {
    it('should validate valid payload', () => {
      const payload = {
        items: [
          { stockId: 'stock-1', quantity: 1, price: 100 }
        ],
        paymentMethod: 'CARD',
        customerName: 'John Doe',
      };
      const result = CreateSaleSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('should validate valid payload with bankId and CREDIT payment method', () => {
      const payload = {
        items: [
          { stockId: 'stock-1', quantity: 1, price: 100 }
        ],
        paymentMethod: 'CREDIT',
        bankId: 'bank-123',
        customerName: 'John Doe',
      };
      const result = CreateSaleSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('should require at least one item', () => {
      const result = CreateSaleSchema.safeParse({
        items: []
      });
      expect(result.success).toBe(false);
    });
  });
});
