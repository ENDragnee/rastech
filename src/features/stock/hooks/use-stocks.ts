"use client";

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { ProductStock } from "@/features/product/hooks/use-products";

export function useProductStocks(productId?: string) {
  return useQuery<{ data: ProductStock[] }>({
    queryKey: ["stocks", productId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (productId) params.append("search", productId);
      const response = await axiosInstance.get(
        `/api/v1/stock?${params.toString()}`,
      );
      return response.data;
    },
    enabled: !!productId,
  });
}
