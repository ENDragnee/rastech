"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";

export interface StockItem {
  id: string;
  serialNumber?: string | null;
  batchNumber?: string | null;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  withVat: boolean;
  productId: string;
  createdAt: string;
  updatedAt: string;
  products: {
    id: string;
    name: string;
    sku: string;
    warrantyDays?: number;
  };
}

export interface StocksResponse {
  data: StockItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 1. Fetch Stocks Query
export function useStocks(search: string = "", page: number = 1) {
  return useQuery<StocksResponse>({
    queryKey: ["stocks", search, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        order: "desc",
        sort: "createdAt",
      });
      if (search) params.append("search", search);
      const response = await axiosInstance.get(
        `/api/v1/stock?${params.toString()}`,
      );
      return response.data;
    },
    staleTime: 1000 * 30,
  });
}

// 2. Create Stock Mutation
export function useCreateStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      productId: string;
      costPrice: number;
      sellingPrice: number;
      quantity: number;
      withVat: boolean;
      serialNumber?: string | null;
      batchNumber?: string | null;
    }) => {
      const response = await axiosInstance.post("/api/v1/stock", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-analytics"] });
    },
  });
}

// 3. Update Stock Mutation
export function useUpdateStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: {
      id: string;
      costPrice?: number;
      sellingPrice?: number;
      quantity?: number;
      withVat?: boolean;
      serialNumber?: string | null;
      batchNumber?: string | null;
    }) => {
      const response = await axiosInstance.patch(
        `/api/v1/stock/${id}`,
        payload,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-analytics"] });
    },
  });
}

// 4. Delete Stock Mutation
export function useDeleteStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(`/api/v1/stock/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-analytics"] });
    },
  });
}
