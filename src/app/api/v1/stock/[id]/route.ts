import {
  UpdateStockInput,
  UpdateStockSchema,
} from "@/features/stock/schemas/stock.schema";
import { DeleteStock } from "@/features/stock/services/delete-stock.service";
import { UpdateStock } from "@/features/stock/services/update-stock.service";
import { CreateApiRoute } from "@/lib/api-handlers/rest.handler";
import { DynamicApiRouteInput } from "@/lib/schemas/dynmaic-route.schema";

export const PATCH = CreateApiRoute({
  moduleName: "UpdateStockAPI",
  schema: UpdateStockSchema,
  requiresAuth: {
    status: true,
    permission: "UPDATE_STOCK",
  },
  handler: async (
    body: UpdateStockInput,
    session: any,
    params: DynamicApiRouteInput | undefined,
    logger: any,
  ) => {
    return await UpdateStock(body, session, params, logger);
  },
});

export const DELETE = CreateApiRoute({
  moduleName: "DeleteStockAPI",
  requiresAuth: {
    status: true,
    permission: "DELETE_STOCK",
  },
  handler: async (
    session: any,
    params: DynamicApiRouteInput | undefined,
    logger: any,
  ) => {
    return await DeleteStock(session, params, logger);
  },
});
