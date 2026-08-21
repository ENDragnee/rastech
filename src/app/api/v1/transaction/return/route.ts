import {
  ProcessReturnSchema,
  ProcessReturnInput,
} from "@/features/transaction/schemas/return.schema";
import { ProcessReturnClaim } from "@/features/transaction/services/process-return.service";
import { CreateApiRoute } from "@/lib/api-handlers/rest.handler";

export const POST = CreateApiRoute({
  moduleName: "ProcessReturnAPI",
  schema: ProcessReturnSchema,
  requiresAuth: {
    status: true,
    permission: "PROCESS_RETURN",
  },
  handler: async (
    body: ProcessReturnInput,
    session: any,
    params: any,
    logger: any,
  ) => {
    return await ProcessReturnClaim(body, session, logger);
  },
});
