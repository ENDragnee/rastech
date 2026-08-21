import {
  CreateCategoryInput,
  CreateCategorySchema,
} from "@/features/category/schemas/category.schema";
import { CreateCategory } from "@/features/category/services/create-category.service";
import { FetchCategories } from "@/features/category/services/fetch-categories.service";
import { CreateApiRoute } from "@/lib/api-handlers/rest.handler";

export const POST = CreateApiRoute({
  moduleName: "CreateCategoryAPI",
  schema: CreateCategorySchema,
  requiresAuth: {
    status: true,
    permission: "CREATE_CATEGORY",
  },
  handler: async (
    body: CreateCategoryInput,
    session: any,
    params: any,
    logger: any,
  ) => {
    return await CreateCategory(body, session, logger);
  },
});

export const GET = CreateApiRoute({
  moduleName: "FetchCategoriesAPI",
  requiresAuth: {
    status: true,
    permission: "FETCH_CATEGORIES",
  },
  handler: async () => {
    return await FetchCategories();
  },
});
