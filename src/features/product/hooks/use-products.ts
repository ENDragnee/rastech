"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  withVat?: boolean;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  stocks?: ProductStock[];
  createdAt?: string;
  updatedAt?: string;
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

// 1. Fetch Products Query
export function useProducts(
  search: string = "",
  categoryId: string = "",
  page: number = 1,
) {
  return useQuery<ProductsResponse>({
    queryKey: ["products", search, categoryId, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        order: "desc",
        sort: "createdAt",
      });
      if (search) params.append("search", search);
      if (categoryId && categoryId !== "ALL")
        params.append("categoryId", categoryId);

      const response = await axiosInstance.get(
        `/api/v1/product?${params.toString()}`,
      );
      return response.data;
    },
    staleTime: 1000 * 30,
  });
}

// 2. Check SKU Availability Query
export function useCheckSku(sku: string, enabled: boolean = true) {
  return useQuery<{ available: boolean; message: string }>({
    queryKey: ["check-sku", sku],
    queryFn: async () => {
      if (!sku.trim()) return { available: true, message: "" };
      const response = await axiosInstance.get(
        `/api/v1/product/check-sku?search=${encodeURIComponent(sku.trim())}`,
      );
      return response.data;
    },
    enabled: enabled && sku.trim().length >= 2,
    staleTime: 0,
  });
}

// 3. Create Product Mutation (includes withVat)
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name: string;
      sku: string;
      categoryId: string;
      description?: string;
      warrantyDays?: number;
      withVat?: boolean;
    }) => {
      const response = await axiosInstance.post("/api/v1/product", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-analytics"] });
    },
  });
}

// 4. Update Product Mutation (includes withVat)
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: {
      id: string;
      name?: string;
      sku?: string;
      categoryId?: string;
      description?: string;
      warrantyDays?: number;
      withVat?: boolean;
    }) => {
      const response = await axiosInstance.patch(
        `/api/v1/product/${id}`,
        payload,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-analytics"] });
    },
  });
}

// 5. Delete Product Mutation
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(`/api/v1/product/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-analytics"] });
    },
  });
}
