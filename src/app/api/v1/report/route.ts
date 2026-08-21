import {
  FetchReportSchema,
  FetchReportInput,
} from "@/features/report/schemas/report.schema";
import { FetchReportData } from "@/features/report/services/fetch-report.service";
import { CreateApiRoute } from "@/lib/api-handlers/rest.handler";

export const GET = CreateApiRoute({
  moduleName: "FetchReportsAPI",
  schema: FetchReportSchema,
  requiresAuth: {
    status: true,
    permission: "FETCH_REPORTS",
  },
  handler: async (req: FetchReportInput) => {
    return await FetchReportData(req);
  },
});
