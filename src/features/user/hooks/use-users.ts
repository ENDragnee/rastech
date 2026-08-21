"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";

export interface UserAccountItem {
  id: string;
  name?: string | null;
  userName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  roles?: { id: string; name: string }[];
}

export interface FetchUsersParams {
  search?: string;
  status?: "ACTIVE" | "INACTIVE";
  page?: number;
  limit?: number;
  sort?: "created_at" | "name" | "userName";
  order?: "asc" | "desc";
}

// 1. Fetch Users Query
export function useUsers(params: FetchUsersParams = {}) {
  const {
    search = "",
    status = "ACTIVE",
    page = 1,
    limit = 10,
    sort = "userName",
    order = "desc",
  } = params;

  return useQuery<{ data: UserAccountItem[]; meta: any }>({
    queryKey: ["users", search, status, page, limit, sort, order],
    queryFn: async () => {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status,
        sort,
        order,
      });

      if (search && search.trim().length >= 2) {
        query.append("search", search.trim());
      }

      const res = await axiosInstance.get(`/api/v1/user?${query.toString()}`);
      return res.data;
    },
    staleTime: 1000 * 30,
  });
}

// 2. Create User Mutation (sends `passowrd` matching your schema)
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name?: string | null;
      userName: string;
      passowrd: string;
      isActive?: boolean;
    }) => {
      const res = await axiosInstance.post("/api/v1/user", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// 3. Update User Mutation
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: {
      id: string;
      name?: string;
      userName?: string;
      passowrd?: string;
    }) => {
      const res = await axiosInstance.patch(`/api/v1/user/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// 4. Deactivate User Mutation (calls DELETE /api/v1/user/[id] for soft delete)
export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await axiosInstance.delete(`/api/v1/user/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
