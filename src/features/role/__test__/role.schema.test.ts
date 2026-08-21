import { describe, it, expect } from 'vitest';
import { CreateRoleSchema, UpdateRoleSchema, FetchRoleSchema } from '../schemas/role.schema';

describe('Role Schemas', () => {
  describe('CreateRoleSchema', () => {
    it('should validate valid input', () => {
      const result = CreateRoleSchema.safeParse({ name: 'Admin', guardName: 'web', permissions: ['1', '2'] });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Admin');
        expect(result.data.guardName).toBe('web');
        expect(result.data.permissions).toEqual(['1', '2']);
      }
    });

    it('should have default guardName', () => {
      const result = CreateRoleSchema.safeParse({ name: 'User' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.guardName).toBe('web');
      }
    });

    it('should fail when name is too short', () => {
      const result = CreateRoleSchema.safeParse({ name: 'A' });
      expect(result.success).toBe(false);
    });
  });

  describe('UpdateRoleSchema', () => {
    it('should validate valid input', () => {
      const result = UpdateRoleSchema.safeParse({ name: 'Admin' });
      expect(result.success).toBe(true);
    });

    it('should allow optional fields', () => {
      const result = UpdateRoleSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should fail when name is too short', () => {
      const result = UpdateRoleSchema.safeParse({ name: 'A' });
      expect(result.success).toBe(false);
    });
  });

  describe('FetchRoleSchema', () => {
    it('should parse valid input', () => {
      const result = FetchRoleSchema.safeParse({ page: 1, limit: 10, search: 'test' });
      expect(result.success).toBe(true);
    });

    it('should apply defaults', () => {
      const result = FetchRoleSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
        expect(result.data.sort).toBe('createdAt');
        expect(result.data.order).toBe('desc');
      }
    });

    it('should fail with invalid page', () => {
      const result = FetchRoleSchema.safeParse({ page: 0 });
      expect(result.success).toBe(false);
    });

    it('should fail with invalid limit', () => {
      const result = FetchRoleSchema.safeParse({ limit: 100 });
      expect(result.success).toBe(false);
    });
  });
});
