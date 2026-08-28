import {
  CreateBankSchema,
  CreateBankInput,
  FetchBankSchema,
  FetchBankInput,
} from "@/features/bank/schemas/bank.schema";
import { CreateBank } from "@/features/bank/services/create-bank.service";
import { FetchBanks } from "@/features/bank/services/fetch-banks.service";
import { CreateApiRoute } from "@/lib/api-handlers/rest.handler";

export const POST = CreateApiRoute({
  moduleName: "CreateBankAPI",
  schema: CreateBankSchema,
  requiresAuth: {
    status: true,
    permission: "CREATE_BANK", // Or ADMIN
  },
  handler: async (
    body: CreateBankInput,
    session: any,
    params: any,
    logger: any,
  ) => {
    return await CreateBank(body, session, logger);
  },
});

export const GET = CreateApiRoute({
  moduleName: "FetchBanksAPI",
  schema: FetchBankSchema,
  requiresAuth: {
    status: true,
    permission: "FETCH_BANK", // Accessible to Cashiers, Managers, Admins
  },
  handler: async (req: FetchBankInput) => {
    return await FetchBanks(req);
  },
});
