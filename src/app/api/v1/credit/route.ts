import {
  CreateCreditSchema,
  CreateCreditInput,
  FetchCreditSchema,
  FetchCreditInput,
} from "@/features/credit/schemas/credit.schema";
import { CreateCredit } from "@/features/credit/services/create-credit.service";
import { FetchCredits } from "@/features/credit/services/fetch-credits.service";
import { CreateApiRoute } from "@/lib/api-handlers/rest.handler";

export const POST = CreateApiRoute({
  moduleName: "CreateCreditAPI",
  schema: CreateCreditSchema,
  requiresAuth: {
    status: true,
    permission: "CREATE_CREDIT",
  },
  handler: async (
    body: CreateCreditInput,
    session: any,
    params: any,
    logger: any,
  ) => {
    return await CreateCredit(body, session, logger);
  },
});

export const GET = CreateApiRoute({
  moduleName: "FetchCreditAPI",
  schema: FetchCreditSchema,
  requiresAuth: {
    status: true,
    permission: "FETCH_CREDIT",
  },
  handler: async (req: FetchCreditInput) => {
    return await FetchCredits(req);
  },
});
