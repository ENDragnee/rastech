"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";

export interface PermissionItem {
  id: string;
  name: string;
  guardName: string;
}

export interface ModuleWithPermissions {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  permissions: PermissionItem[];
}

export interface RoleItem {
  id: string;
  name: string;
  guardName: string;
  createdAt: string;
  updatedAt: string;
  permissions: PermissionItem[];
  _count?: {
    users: number;
  };
}

export interface FetchRoleParams {
  search?: string;
  page?: number;
  limit?: number;
  sort?: "createdAt" | "name";
  order?: "asc" | "desc";
}

// 1. Fetch Paginated Roles
export function useRoles(params: FetchRoleParams = {}) {
  const {
    search = "",
    page = 1,
    limit = 10,
    sort = "createdAt",
    order = "desc",
  } = params;

  return useQuery<{ data: RoleItem[]; meta: any }>({
    queryKey: ["roles", search, page, limit, sort, order],
    queryFn: async () => {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort,
        order,
      });

      if (search && search.trim().length >= 2) {
        query.append("search", search.trim());
      }

      const res = await axiosInstance.get(`/api/v1/role?${query.toString()}`);
      return res.data;
    },
    staleTime: 1000 * 30,
  });
}

// 2. Fetch All Permissions Grouped by Module
export function useModulesWithPermissions() {
  return useQuery<ModuleWithPermissions[]>({
    queryKey: ["modules-with-permissions"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/v1/permission");
      return res.data.data || res.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// 3. Create Role Mutation
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name: string;
      guardName?: string;
      permissions?: string[];
    }) => {
      const res = await axiosInstance.post("/api/v1/role", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

// 4. Update Role Mutation
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: {
      id: string;
      name?: string;
      guardName?: string;
      permissions?: string[];
    }) => {
      const res = await axiosInstance.patch(`/api/v1/role/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// 5. Delete Role Mutation
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await axiosInstance.delete(`/api/v1/role/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}
