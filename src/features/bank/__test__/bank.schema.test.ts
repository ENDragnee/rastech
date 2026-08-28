import { describe, it, expect } from 'vitest';
import { CreateBankSchema, UpdateBankSchema, FetchBankSchema } from '../schemas/bank.schema';

describe('Bank Schemas', () => {
  describe('CreateBankSchema', () => {
    it('should validate valid bank input', () => {
      const input = {
        name: 'Commercial Bank of Ethiopia',
        accountNumber: '1000123456789',
      };
      const result = CreateBankSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should validate bank input without account number', () => {
      const input = { name: 'Awash Bank' };
      const result = CreateBankSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should invalidate name with less than 2 characters', () => {
      const input = { name: 'A' };
      const result = CreateBankSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should invalidate non-numeric account number', () => {
      const input = { name: 'Bank Name', accountNumber: '1000-ABC' };
      const result = CreateBankSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('UpdateBankSchema', () => {
    it('should validate partial bank inputs', () => {
      expect(UpdateBankSchema.safeParse({ name: 'Dashen Bank' }).success).toBe(true);
      expect(UpdateBankSchema.safeParse({ accountNumber: '99887766' }).success).toBe(true);
      expect(UpdateBankSchema.safeParse({}).success).toBe(true);
    });
  });

  describe('FetchBankSchema', () => {
    it('should validate search query filter', () => {
      const result = FetchBankSchema.safeParse({ search: 'Abyssinia' });
      expect(result.success).toBe(true);
    });
  });
});
