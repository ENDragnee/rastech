import { GetDashboardAnalytics } from "../services/analytics.service";
import { CreateGraphqlRoute } from "@/lib/api-handlers/graphql.handler";

export const analyticsResolvers = {
  Query: {
    getDashboardAnalytics: CreateGraphqlRoute({
      moduleName: "GetDashboardAnalyticsResolver",
      requiresAuth: {
        status: true,
        permission: "VIEW_ANALYTICS",
      },
      handler: async () => {
        return await GetDashboardAnalytics();
      },
    }),
  },
};
