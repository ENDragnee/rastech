import { CreateApiRoute } from "@/lib/api-handlers/rest.handler";
import {
  FetchProductsSchema,
  FetchProductsInput,
} from "@/features/product/schemas/product.schema";
import { CheckSku } from "@/features/product/services/check-sku.service";

export const GET = CreateApiRoute({
  moduleName: "FetchProductsAPI",
  schema: FetchProductsSchema.pick({ search: true }),
  requiresAuth: {
    status: true,
    permission: "FETCH_PRODUCTS",
  },
  handler: async (req: Pick<FetchProductsInput, "search">) => {
    return await CheckSku(req);
  },
});
