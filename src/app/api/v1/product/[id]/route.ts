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
    params: DynamicApiRouteInput | undefined,
    session: any,
    logger: any,
  ) => {
    return await UpdateProduct(body, params, session, logger);
  },
});

export const DELETE = CreateApiRoute({
  moduleName: "DeleteProductAPI",
  requiresAuth: {
    status: true,
    permission: "DELETE_PRODUCT",
  },
  handler: async (
    params: DynamicApiRouteInput | undefined,
    session: any,
    logger: any,
  ) => {
    return await DeleteProduct(params, session, logger);
  },
});
