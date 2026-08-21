import { describe, it, expect } from 'vitest';
import { ProcessReturnSchema } from '../schemas/return.schema';

describe('return.schema', () => {
  it('should validate a valid return payload', () => {
    const payload = {
      originalTransactionId: 'tx-123',
      type: 'DEFECTIVE',
      quantity: 1,
      reason: 'Broken screen',
    };
    const result = ProcessReturnSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('should invalidate missing transaction ID', () => {
    const payload = {
      originalTransactionId: '',
      type: 'RETURNED',
      quantity: 1,
      reason: 'Not needed',
    };
    const result = ProcessReturnSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});
