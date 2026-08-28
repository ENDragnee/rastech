"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";

export interface BankItem {
  id: string;
  name: string;
  accountNumber?: string | null;
  _count?: {
    transactions: number;
  };
}

export function useBanks(search = "") {
  return useQuery<BankItem[]>({
    queryKey: ["banks", search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      const res = await axiosInstance.get(`/api/v1/bank?${params.toString()}`);
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreateBank() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      accountNumber?: string | null;
    }) => {
      const res = await axiosInstance.post("/api/v1/bank", payload);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["banks"] }),
  });
}

export function useUpdateBank() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: {
      id: string;
      name?: string;
      accountNumber?: string | null;
    }) => {
      const res = await axiosInstance.patch(`/api/v1/bank/${id}`, payload);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["banks"] }),
  });
}

export function useDeleteBank() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await axiosInstance.delete(`/api/v1/bank/${id}`);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["banks"] }),
  });
}
