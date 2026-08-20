import {
  FetchLogInput,
  FetchLogSchema,
} from "@/features/log/schemas/log.schema";
import { FetchLogs } from "@/features/log/services/fetch-logs.service";
import { CreateApiRoute } from "@/lib/api-handlers/rest.handler";

export const GET = CreateApiRoute({
  moduleName: "FetchLogAPI",
  schema: FetchLogSchema,
  requiresAuth: {
    status: true,
    permission: "FETCH_LOGS",
  },
  handler: async (req: FetchLogInput) => {
    return await FetchLogs(req);
  },
});
