import {
  FetchReportInput,
  FetchReportSchema,
} from "@/features/report/schemas/report.schema";
import { FetchReport } from "@/features/report/services/fetch-report.service";
import { CreateApiRoute } from "@/lib/api-handlers/rest.handler";

export const GET = CreateApiRoute({
  moduleName: "FetchReportAPI",
  schema: FetchReportSchema,
  requiresAuth: {
    status: true,
    permission: "FETCH_REPORTS",
  },
  handler: async (req: FetchReportInput) => {
    return await FetchReport(req);
  },
});
