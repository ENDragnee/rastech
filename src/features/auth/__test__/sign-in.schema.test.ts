import { describe, it, expect } from 'vitest';
import { UserNameSignInSchema } from '../schemas/sign-in.schema';

describe('UserNameSignInSchema', () => {
  it('should validate correctly with valid data', () => {
    const validData = {
      userName: 'john_doe',
      password: 'password123',
    };
    const result = UserNameSignInSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should fail validation if userName is too short', () => {
    const invalidData = {
      userName: 'jo', // less than 3 chars
      password: 'password123',
    };
    const result = UserNameSignInSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should fail validation if password is missing', () => {
    const invalidData = {
      userName: 'john_doe',
    };
    const result = UserNameSignInSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should fail validation if userName is missing', () => {
    const invalidData = {
      password: 'password',
    };
    const result = UserNameSignInSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
