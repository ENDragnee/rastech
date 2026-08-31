"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";

export interface RoleReference {
  id: string;
  name: string;
}

export interface UserAccountItem {
  id: string;
  name?: string | null;
  userName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  roles?: RoleReference[];
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

// 2. Fetch Available Roles Helper
export function useAvailableRoles() {
  return useQuery<RoleReference[]>({
    queryKey: ["available-roles-list"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/v1/role?limit=50");
      return res.data.data || res.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

// 3. Create User Mutation
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name?: string | null;
      userName: string;
      passowrd: string;
      roleIds?: string[];
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

// 4. Update User Mutation (Includes roleIds & isActive)
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
      roleIds?: string[];
      isActive?: boolean;
    }) => {
      const res = await axiosInstance.patch(`/api/v1/user/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

// 5. Deactivate User Mutation
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

// 6. Reactivate User Mutation
export function useReactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await axiosInstance.patch(`/api/v1/user/${id}`, {
        isActive: true,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
