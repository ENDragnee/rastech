"use client";

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";

export interface TimeSeriesPoint {
  label: string;
  date: string;
  revenue: number;
  profit: number;
  cost: number;
  stockValue: number;
  potentialRevenue: number;
}

export interface DashboardAnalyticsData {
  health: {
    turnoverRate: number;
    stockToSalesRatio: number;
    lowStockWarningCount: number;
    outOfStockCount: number;
  };
  performance: {
    totalRevenue: number;
    totalCostOfSold: number;
    grossProfit: number;
    grossMarginPercentage: number;
    currentStockValue: number;
    potentialRevenue: number;
    roi: number;
  };
  timeline: TimeSeriesPoint[];
  categorySales: {
    categoryId: string;
    categoryName: string;
    revenue: number;
    quantity: number;
  }[];
  lowStockItems: {
    id: string;
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
  }[];
  bestSellers: {
    productId: string;
    name: string;
    sku: string;
    quantity: number;
    revenue: number;
  }[];
  bestValueItems: {
    stockId: string;
    productId: string;
    productName: string;
    markupPercentage: number;
    sellingPrice: number;
    costPrice: number;
  }[];
  itemPerformance: {
    productId: string;
    name: string;
    sku: string;
    categoryName: string;
    unitsSold: number;
    revenue: number;
    costOfGoods: number;
    grossProfit: number;
    marginPercentage: number;
    currentStock: number;
    status: "HEALTHY" | "LOW_STOCK" | "OUT_OF_STOCK" | "DEAD_STOCK";
  }[];
  defectMetrics: {
    totalLossValue: number;
    defectCount: number;
    adjustmentLossCount: number;
  };
}

const DASHBOARD_ANALYTICS_QUERY = `
  query GetDashboardAnalytics($timeframe: Timeframe) {
    getDashboardAnalytics(timeframe: $timeframe) {
      health {
        turnoverRate
        stockToSalesRatio
        lowStockWarningCount
        outOfStockCount
      }
      performance {
        totalRevenue
        totalCostOfSold
        grossProfit
        grossMarginPercentage
        currentStockValue
        potentialRevenue
        roi
      }
      timeline {
        label
        date
        revenue
        profit
        cost
        stockValue
        potentialRevenue
      }
      categorySales {
        categoryId
        categoryName
        revenue
        quantity
      }
      lowStockItems {
        id
        productId
        productName
        sku
        quantity
      }
      bestSellers {
        productId
        name
        sku
        quantity
        revenue
      }
      bestValueItems {
        stockId
        productId
        productName
        markupPercentage
        sellingPrice
        costPrice
      }
      itemPerformance {
        productId
        name
        sku
        categoryName
        unitsSold
        revenue
        costOfGoods
        grossProfit
        marginPercentage
        currentStock
        status
      }
      defectMetrics {
        totalLossValue
        defectCount
        adjustmentLossCount
      }
    }
  }
`;

export function useDashboardAnalytics(
  timeframe: "WEEK" | "MONTH" | "YEAR" = "WEEK",
) {
  return useQuery<DashboardAnalyticsData>({
    queryKey: ["dashboard-analytics", timeframe],
    queryFn: async () => {
      const response = await axiosInstance.post("/api/graphql", {
        query: DASHBOARD_ANALYTICS_QUERY,
        variables: { timeframe },
      });

      if (response.data.errors) {
        throw new Error(response.data.errors[0]?.message || "GraphQL error");
      }

      return response.data.data.getDashboardAnalytics;
    },
    staleTime: 1000 * 60, // 1 minute
  });
}
