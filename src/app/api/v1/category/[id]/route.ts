import {
  UpdateCategoryInput,
  UpdateCategorySchema,
} from "@/features/category/schemas/category.schema";
import { DeleteCategory } from "@/features/category/services/delete-catagory.service";
import { UpdateCategory } from "@/features/category/services/update-category.service";
import { CreateApiRoute } from "@/lib/api-handlers/rest.handler";
import { DynamicApiRouteInput } from "@/lib/schemas/dynmaic-route.schema";

export const PATCH = CreateApiRoute({
  moduleName: "UpdateCategoryAPI",
  schema: UpdateCategorySchema,
  requiresAuth: {
    status: true,
    permission: "UPATE_CATEGORY",
  },
  handler: async (
    body: UpdateCategoryInput,
    session: any,
    params: DynamicApiRouteInput | undefined,
    logger: any,
  ) => {
    return await UpdateCategory(body, session, params, logger);
  },
});

export const DELETE = CreateApiRoute({
  moduleName: "DeleteCategoryAPI",
  requiresAuth: {
    status: true,
    permission: "DELETE_CATEGORY",
  },
  handler: async (
    body: any,
    session: any,
    params: DynamicApiRouteInput | undefined,
    logger: any,
  ) => {
    return await DeleteCategory(session, params, logger);
  },
});
