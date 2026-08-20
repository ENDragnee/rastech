import gql from "graphql-tag";

export const analyticsTypeDefs = gql`
  type HealthMetrics {
    turnoverRate: Float!
    stockToSalesRatio: Float!
    lowStockWarningCount: Int!
  }

  type PerformanceMetrics {
    totalRevenue: Float!
    totalCostOfSold: Float!
    grossMarginPercentage: Float!
    currentStockValue: Float!
    potentialRevenue: Float!
    roi: Float!
  }

  type LowStockItem {
    id: ID!
    productId: ID!
    productName: String!
    quantity: Int!
  }

  type IndicatorMetrics {
    lowStockItems: [LowStockItem!]!
  }

  type BestSeller {
    productId: ID!
    name: String!
    quantity: Int!
    revenue: Float!
  }

  type BestValueItem {
    stockId: ID!
    productId: ID!
    productName: String!
    markupPercentage: Float!
    sellingPrice: Float!
    costPrice: Float!
  }

  type DashboardAnalytics {
    health: HealthMetrics!
    performance: PerformanceMetrics!
    indicators: IndicatorMetrics!
    bestSellers: [BestSeller!]!
    bestValueItems: [BestValueItem!]!
  }

  type Query {
    getDashboardAnalytics: DashboardAnalytics!
  }
`;
