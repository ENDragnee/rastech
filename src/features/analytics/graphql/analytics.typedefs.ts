import gql from "graphql-tag";

export const analyticsTypeDefs = gql`
  enum Timeframe {
    WEEK
    MONTH
    YEAR
  }

  type TimeSeriesPoint {
    label: String!
    date: String!
    revenue: Float!
    profit: Float!
    cost: Float!
    stockValue: Float!
    potentialRevenue: Float!
  }

  type HealthMetrics {
    turnoverRate: Float!
    stockToSalesRatio: Float!
    lowStockWarningCount: Int!
    outOfStockCount: Int!
  }

  type PerformanceMetrics {
    totalRevenue: Float!
    totalCostOfSold: Float!
    grossProfit: Float!
    grossMarginPercentage: Float!
    currentStockValue: Float!
    potentialRevenue: Float!
    roi: Float!
  }

  type LowStockItem {
    id: ID!
    productId: ID!
    productName: String!
    sku: String!
    quantity: Int!
  }

  type CategorySales {
    categoryId: ID!
    categoryName: String!
    revenue: Float!
    quantity: Int!
  }

  type BestSeller {
    productId: ID!
    name: String!
    sku: String!
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

  type ItemPerformance {
    productId: ID!
    name: String!
    sku: String!
    categoryName: String!
    unitsSold: Int!
    revenue: Float!
    costOfGoods: Float!
    grossProfit: Float!
    marginPercentage: Float!
    currentStock: Int!
    status: String!
  }

  type DefectMetrics {
    totalLossValue: Float!
    defectCount: Int!
    adjustmentLossCount: Int!
  }

  type DashboardAnalytics {
    health: HealthMetrics!
    performance: PerformanceMetrics!
    timeline: [TimeSeriesPoint!]!
    categorySales: [CategorySales!]!
    lowStockItems: [LowStockItem!]!
    bestSellers: [BestSeller!]!
    bestValueItems: [BestValueItem!]!
    itemPerformance: [ItemPerformance!]!
    defectMetrics: DefectMetrics!
  }

  type Query {
    getDashboardAnalytics(timeframe: Timeframe): DashboardAnalytics!
  }
`;
