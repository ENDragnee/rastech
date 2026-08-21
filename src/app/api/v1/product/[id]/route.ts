import {
  UpdateProductInput,
  UpdateProductSchema,
} from "@/features/product/schemas/product.schema";
import { DeleteProduct } from "@/features/product/services/delete-product.service";
import { UpdateProduct } from "@/features/product/services/update-product.service";
import { CreateApiRoute } from "@/lib/api-handlers/rest.handler";
import { DynamicApiRouteInput } from "@/lib/schemas/dynmaic-route.schema";

export const PATCH = CreateApiRoute({
  moduleName: "UpdateProductAPI",
  schema: UpdateProductSchema,
  requiresAuth: {
    status: true,
    permission: "UPDATE_PRODUCT",
  },
  handler: async (
    body: UpdateProductInput,
    session: any,
    params: DynamicApiRouteInput | undefined,
    logger: any,
  ) => {
    return await UpdateProduct(body, session, params, logger);
  },
});

export const DELETE = CreateApiRoute({
  moduleName: "DeleteProductAPI",
  requiresAuth: {
    status: true,
    permission: "DELETE_PRODUCT",
  },
  handler: async (
    body: any,
    session: any,
    params: DynamicApiRouteInput | undefined,
    logger: any,
  ) => {
    return await DeleteProduct(session, params, logger);
  },
});
