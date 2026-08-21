import {
  CreateStockInput,
  CreateStockSchema,
  FetchStockInput,
  FetchStockSchema,
} from "@/features/stock/schemas/stock.schema";
import { CreateStock } from "@/features/stock/services/create-stock.service";
import { FetchStocks } from "@/features/stock/services/fetch-stocks.service";
import { CreateApiRoute } from "@/lib/api-handlers/rest.handler";

export const POST = CreateApiRoute({
  moduleName: "CreateStockAPI",
  schema: CreateStockSchema,
  requiresAuth: {
    status: true,
    permission: "CREATE_STOCK",
  },
  handler: async (
    body: CreateStockInput,
    session: any,
    params: any,
    logger: any,
  ) => {
    return await CreateStock(body, session, logger);
  },
});

export const GET = CreateApiRoute({
  moduleName: "FetchStockAPI",
  schema: FetchStockSchema,
  requiresAuth: {
    status: true,
    permission: "FETCH_STOCK",
  },
  handler: async (req: FetchStockInput) => {
    return await FetchStocks(req);
  },
});
