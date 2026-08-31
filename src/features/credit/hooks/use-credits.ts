"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";

export interface CreditItem {
  id: string;
  customerName: string;
  customerPhone?: string | null;
  customerIdDoc?: string | null;
  quantity: number;
  totalAmount: number;
  dueDate?: string | null;
  status: "PENDING" | "PAID" | "RETURNED" | "DEFAULTED";
  stockId: string;
  transactionId: string;
  createdAt: string;
  updatedAt: string;
  stock: {
    id: string;
    serialNumber?: string | null;
    batchNumber?: string | null;
    products: {
      id: string;
      name: string;
      sku: string;
    };
  };
  transaction: {
    invoiceNumber: string;
    price: number;
  };
  createdBy?: {
    name?: string | null;
    userName: string;
  };
  approvedBy?: {
    name?: string | null;
    userName: string;
  };
}

export function useCredits(
  search = "",
  status = "",
  overdueOnly = false,
  page = 1,
) {
  return useQuery<{ data: CreditItem[]; meta: any }>({
    queryKey: ["credits", search, status, overdueOnly, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      if (search) params.append("search", search);
      if (status && status !== "ALL") params.append("status", status);
      if (overdueOnly) params.append("overdueOnly", "true");

      const res = await axiosInstance.get(
        `/api/v1/credit?${params.toString()}`,
      );
      return res.data;
    },
  });
}

export function useCreateCredit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      stockId: string;
      quantity: number;
      totalAmount: number;
      customerName: string;
      customerPhone?: string | null;
      customerIdDoc?: string | null;
      dueDate?: string | null;
    }) => {
      const res = await axiosInstance.post("/api/v1/credit", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credits"] });
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useUpdateCreditStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: "PAID" | "RETURNED" | "DEFAULTED";
      notes?: string;
    }) => {
      const res = await axiosInstance.patch(`/api/v1/credit/${id}`, {
        status,
        notes,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credits"] });
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
