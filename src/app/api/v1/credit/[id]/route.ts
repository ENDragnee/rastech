import {
  UpdateCreditSchema,
  UpdateCreditInput,
} from "@/features/credit/schemas/credit.schema";
import { UpdateCredit } from "@/features/credit/services/update-credit.service";
import { CreateApiRoute } from "@/lib/api-handlers/rest.handler";

export const PATCH = CreateApiRoute({
  moduleName: "UpdateCreditAPI",
  schema: UpdateCreditSchema,
  requiresAuth: {
    status: true,
    permission: "UPDATE_CREDIT",
  },
  handler: async (
    body: UpdateCreditInput,
    session: any,
    context: any,
    logger: any,
  ) => {
    const creditId = context?.id;
    return await UpdateCredit(creditId, body, session, logger);
  },
});
