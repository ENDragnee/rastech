import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyticsResolvers } from '../graphql/analytics.resolvers';
import * as analyticsService from '../services/analytics.service';

vi.mock('../services/analytics.service', () => ({
  GetDashboardAnalytics: vi.fn(),
}));

vi.mock('@/lib/api-handlers/graphql.handler', () => ({
  CreateGraphqlRoute: vi.fn((opts) => opts.handler),
}));

describe('analyticsResolvers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call GetDashboardAnalytics via getDashboardAnalytics resolver', async () => {
    const mockData = { health: {} };
    vi.mocked(analyticsService.GetDashboardAnalytics).mockResolvedValue(mockData as any);

    const handler = (analyticsResolvers.Query as any).getDashboardAnalytics;
    const result = await handler();

    expect(result).toBe(mockData);
    expect(analyticsService.GetDashboardAnalytics).toHaveBeenCalled();
  });
});
