"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";

export interface TransactionItem {
  id: string;
  invoiceNumber: string;
  type: "SOLD" | "PURCHASED" | "RETURNED" | "DEFECTIVE" | "ADJUSTMENT_LOSS";
  quantity: number;
  price: number;
  paymentMethod?: "CASH" | "CARD" | "TRANSFER" | "ADJUSTMENT_LOSS" | null;
  customerName?: string | null;
  customerPhone?: string | null;
  warrantyEndsAt?: string | null;
  stockId: string;
  userId?: string | null;
  createdAt: string;
  stocks?: {
    id: string;
    serialNumber?: string | null;
    batchNumber?: string | null;
    products?: {
      id: string;
      name: string;
      sku: string;
      warrantyDays?: number;
    };
  };
  users?: {
    name?: string | null;
    userName: string;
  };
}

export function useTransactions(search: string = "", page: number = 1) {
  return useQuery<{ data: TransactionItem[]; meta: any }>({
    queryKey: ["transactions", search, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        order: "desc",
        sort: "createdAt",
      });
      if (search) params.append("search", search);
      const response = await axiosInstance.get(
        `/api/v1/transaction?${params.toString()}`,
      );
      return response.data;
    },
  });
}

// 1. Hook for Multi-Item Cart POS Checkout
export function useCheckoutSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      items: { stockId: string; quantity: number; price: number }[];
      paymentMethod: "CASH" | "CARD" | "TRANSFER";
      customerName: string;
      customerPhone: string;
    }) => {
      const response = await axiosInstance.post(
        "/api/v1/transaction/sale",
        payload,
      );
      return response.data; // Returns { invoiceNumber, transactions }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
    },
  });
}

// 2. Hook for Return & Warranty Claims
export function useProcessReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      originalTransactionId: string;
      type: "RETURNED" | "DEFECTIVE";
      quantity: number;
      reason: string;
    }) => {
      const response = await axiosInstance.post(
        "/api/v1/transaction/return",
        payload,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
    },
  });
}
