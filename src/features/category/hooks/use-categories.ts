"use client";

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";

export interface Category {
  id: string;
  name: string;
  description?: string | null;
}

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await axiosInstance.get("/api/v1/category");
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
