"use client";

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { ReportType } from "../schemas/report.schema";

export interface ReportParams {
  type: ReportType;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
}

export function useReportData(params: ReportParams, enabled: boolean = true) {
  return useQuery({
    queryKey: ["manager-report", params],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        type: params.type,
      });
      if (params.startDate) queryParams.append("startDate", params.startDate);
      if (params.endDate) queryParams.append("endDate", params.endDate);
      if (params.categoryId && params.categoryId !== "ALL") {
        queryParams.append("categoryId", params.categoryId);
      }

      const response = await axiosInstance.get(
        `/api/v1/report?${queryParams.toString()}`,
      );
      return response.data;
    },
    enabled,
    staleTime: 1000 * 30,
  });
}
