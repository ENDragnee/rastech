import { CreateGraphqlRoute } from "@/lib/api-handlers/graphql.handler";
import { GetDashboardAnalytics } from "../services/analytics.service";

export const analyticsResolvers = {
  Query: {
    getDashboardAnalytics: CreateGraphqlRoute({
      moduleName: "DashboardAnalytics",
      requiresAuth: {
        status: true,
        permission: "VIEW_ANALYTICS", // Ensure this permission exists in your DB or change it as needed
      },
      handler: async () => {
        return await GetDashboardAnalytics();
      },
    }),
  },
};
