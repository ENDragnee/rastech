import {
  CreateSaleSchema,
  CreateSaleInput,
} from "@/features/transaction/schemas/sale.schema";
import { ProcessSaleCheckout } from "@/features/transaction/services/process-sale.service";
import { CreateApiRoute } from "@/lib/api-handlers/rest.handler";

export const POST = CreateApiRoute({
  moduleName: "SaleCheckoutAPI",
  schema: CreateSaleSchema,
  requiresAuth: {
    status: true,
    permission: "PROCESS_SALE",
  },
  handler: async (
    body: CreateSaleInput,
    session: any,
    params: any,
    logger: any,
  ) => {
    return await ProcessSaleCheckout(body, session, logger);
  },
});
