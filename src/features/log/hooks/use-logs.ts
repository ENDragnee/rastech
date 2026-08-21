"use client";

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { LogSeverity } from "../schemas/log.schema";

export interface LogItem {
  id: string;
  type: string;
  severity: LogSeverity;
  message: string;
  details?: Record<string, any> | null;
  userId?: string | null;
  ipAddress?: string | null;
  targetId?: string | null;
  targetName?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name?: string | null;
    userName: string;
  } | null;
}

export interface FetchLogsParams {
  search?: string;
  page?: number;
  limit?: number;
  sort?: "createdAt" | "type" | "severity";
  order?: "asc" | "desc";
  severity?: LogSeverity;
  type?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export function useLogs(params: FetchLogsParams = {}) {
  const {
    search = "",
    page = 1,
    limit = 20,
    sort = "createdAt",
    order = "desc",
    severity,
    type,
    userId,
    startDate,
    endDate,
  } = params;

  return useQuery<{
    data: LogItem[];
    stats: {
      total: number;
      info: number;
      warning: number;
      error: number;
      fatal: number;
    };
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>({
    queryKey: [
      "logs",
      search,
      page,
      limit,
      sort,
      order,
      severity,
      type,
      userId,
      startDate,
      endDate,
    ],
    queryFn: async () => {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort,
        order,
      });

      if (search && search.trim().length >= 1)
        query.append("search", search.trim());
      if (severity) query.append("severity", severity);
      if (type && type.trim()) query.append("type", type.trim());
      if (userId) query.append("userId", userId);
      if (startDate) query.append("startDate", startDate);
      if (endDate) query.append("endDate", endDate);

      const res = await axiosInstance.get(`/api/v1/log?${query.toString()}`);
      return res.data;
    },
    staleTime: 1000 * 15,
  });
}
