import { VoidTransaction } from "@/features/transaction/services/void-transaction.service";
import { CreateApiRoute } from "@/lib/api-handlers/rest.handler";
import { VoidTransactionSchema } from "@/features/transaction/schemas/void.schema";

export const POST = CreateApiRoute({
  moduleName: "VoidTransactionAPI",
  schema: VoidTransactionSchema,
  requiresAuth: {
    status: true,
    permission: "VOID_TRANSACTION", // Admin exclusive
  },
  handler: async (body: any, session: any, params: any, logger: any) => {
    return await VoidTransaction(body, session, logger);
  },
});
