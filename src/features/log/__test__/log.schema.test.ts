import { describe, it, expect } from 'vitest';
import { FetchLogSchema, LogSeverityEnum } from '../schemas/log.schema';

describe('Log Schemas', () => {
  describe('LogSeverityEnum', () => {
    it('should validate valid severities', () => {
      expect(LogSeverityEnum.safeParse('INFO').success).toBe(true);
      expect(LogSeverityEnum.safeParse('WARNING').success).toBe(true);
      expect(LogSeverityEnum.safeParse('ERROR').success).toBe(true);
      expect(LogSeverityEnum.safeParse('FATAL').success).toBe(true);
    });

    it('should invalidate invalid severities', () => {
      expect(LogSeverityEnum.safeParse('DEBUG').success).toBe(false);
    });
  });

  describe('FetchLogSchema', () => {
    it('should validate empty input with defaults', () => {
      const result = FetchLogSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
        expect(result.data.sort).toBe('createdAt');
        expect(result.data.order).toBe('desc');
      }
    });

    it('should validate provided input', () => {
      const input = {
        page: '2',
        limit: '50',
        sort: 'severity',
        order: 'asc',
        search: ' test search ',
        severity: 'INFO',
        type: 'AUTH_LOGIN_SUCCESS',
        userId: 'user-1',
        startDate: '2026-08-21',
        endDate: '2026-08-22'
      };
      const result = FetchLogSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(50);
        expect(result.data.sort).toBe('severity');
        expect(result.data.order).toBe('asc');
        expect(result.data.search).toBe('test search'); // trimmed
        expect(result.data.severity).toBe('INFO');
        expect(result.data.type).toBe('AUTH_LOGIN_SUCCESS');
        expect(result.data.userId).toBe('user-1');
        expect(result.data.startDate).toBe('2026-08-21');
        expect(result.data.endDate).toBe('2026-08-22');
      }
    });

    it('should invalidate invalid page', () => {
      expect(FetchLogSchema.safeParse({ page: 0 }).success).toBe(false);
      expect(FetchLogSchema.safeParse({ page: -1 }).success).toBe(false);
    });

    it('should invalidate invalid limit', () => {
      expect(FetchLogSchema.safeParse({ limit: 4 }).success).toBe(false);
      expect(FetchLogSchema.safeParse({ limit: 101 }).success).toBe(false);
    });

    it('should invalidate invalid sort', () => {
      expect(FetchLogSchema.safeParse({ sort: 'invalid' }).success).toBe(false);
    });

    it('should invalidate invalid order', () => {
      expect(FetchLogSchema.safeParse({ order: 'invalid' }).success).toBe(false);
    });
  });
});
