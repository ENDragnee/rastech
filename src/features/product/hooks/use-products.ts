"use client";

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";

export interface ProductStock {
  id: string;
  serialNumber?: string | null;
  batchNumber?: string | null;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  withVat: boolean;
}

export interface ProductItem {
  id: string;
  name: string;
  sku: string;
  description?: string | null;
  warrantyDays?: number;
  categoryId: string;
  stocks?: ProductStock[];
}

export interface ProductsResponse {
  data: ProductItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function useProducts(search: string = "", categoryId: string = "") {
  return useQuery<ProductsResponse>({
    queryKey: ["products", search, categoryId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (categoryId && categoryId !== "ALL")
        params.append("categoryId", categoryId);
      params.append("limit", "50");

      const response = await axiosInstance.get(
        `/api/v1/product?${params.toString()}`,
      );
      return response.data;
    },
    staleTime: 1000 * 30, // 30 seconds
  });
}
