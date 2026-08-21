import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateCategorySchema, UpdateCategorySchema } from '../schemas/category.schema';

describe('Category Schemas', () => {
  describe('CreateCategorySchema', () => {
    it('should validate valid input', () => {
      const input = { name: 'Electronics', description: 'Gadgets and devices' };
      const result = CreateCategorySchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should validate input without description', () => {
      const input = { name: 'Electronics' };
      const result = CreateCategorySchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should invalidate when name is too short', () => {
      const input = { name: 'El' };
      const result = CreateCategorySchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("The minium number of characters needed is 3");
      }
    });

    it('should invalidate when name is missing', () => {
      const input = { description: 'Gadgets' };
      const result = CreateCategorySchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('UpdateCategorySchema', () => {
    it('should validate valid input with name and description', () => {
      const input = { name: 'Electronics', description: 'Gadgets and devices' };
      const result = UpdateCategorySchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should validate valid input with only name', () => {
      const input = { name: 'Electronics' };
      const result = UpdateCategorySchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should validate valid input with only description', () => {
      const input = { description: 'Gadgets and devices' };
      const result = UpdateCategorySchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should validate empty input', () => {
      const input = {};
      const result = UpdateCategorySchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should invalidate when name is too short', () => {
      const input = { name: 'El' };
      const result = UpdateCategorySchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("The minium number of characters needed is 3");
      }
    });
  });
});
