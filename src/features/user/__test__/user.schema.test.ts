import { describe, it, expect } from 'vitest';
import { CreateUserSchema, UpdateUserSchema, FetchUsersSchema } from '../schemas/user.schema';

describe('User Schemas', () => {
  describe('CreateUserSchema', () => {
    it('should validate valid input', () => {
      const result = CreateUserSchema.safeParse({ userName: 'testuser', passowrd: 'password123' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isActive).toBe(true); // default
      }
    });

    it('should fail when userName is too short', () => {
      const result = CreateUserSchema.safeParse({ userName: 'ab', passowrd: 'pwd' });
      expect(result.success).toBe(false);
    });
  });

  describe('UpdateUserSchema', () => {
    it('should validate valid input', () => {
      const result = UpdateUserSchema.safeParse({ userName: 'newname' });
      expect(result.success).toBe(true);
    });

    it('should allow empty input', () => {
      const result = UpdateUserSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should validate roleIds', () => {
      const result = UpdateUserSchema.safeParse({ roleIds: ['role-1'] });
      expect(result.success).toBe(true);
    });
  });

  describe('FetchUsersSchema', () => {
    it('should have default values', () => {
      const result = FetchUsersSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
        expect(result.data.status).toBe('ACTIVE');
        expect(result.data.sort).toBe('userName');
        expect(result.data.order).toBe('desc');
      }
    });
  });
});
