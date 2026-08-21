import {
  CreateTransactionInput,
  CreateTransactionSchema,
  FetchTransactionInput,
  FetchTransactionSchema,
} from "@/features/transaction/schemas/transaction.schema";
import { CreateTransaction } from "@/features/transaction/services/create-transaction.service";
import { FetchTransactions } from "@/features/transaction/services/fetch-transactions.service";
import { CreateApiRoute } from "@/lib/api-handlers/rest.handler";

export const POST = CreateApiRoute({
  moduleName: "CreateTransactionAPI",
  schema: CreateTransactionSchema,
  requiresAuth: {
    status: true,
    permission: "CREATE_TRANSACTION",
  },
  handler: async (
    body: CreateTransactionInput,
    session: any,
    params: any,
    logger: any,
  ) => {
    return await CreateTransaction(body, session, logger);
  },
});

export const GET = CreateApiRoute({
  moduleName: "FetchTransactionAPI",
  schema: FetchTransactionSchema,
  requiresAuth: {
    status: true,
    permission: "FETCH_TRANSACTION",
  },
  handler: async (req: FetchTransactionInput) => {
    return await FetchTransactions(req);
  },
});
