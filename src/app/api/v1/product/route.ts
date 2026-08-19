import {
  CreateProductInput,
  CreateProductSchema,
  FetchProductsInput,
  FetchProductsSchema,
} from "@/features/product/schemas/product.schema";
import { CreateProduct } from "@/features/product/services/create-product";
import { FetchProducts } from "@/features/product/services/fetch-products.service";
import { CreateApiRoute } from "@/lib/api-handlers/rest.handler";

export const POST = CreateApiRoute({
  moduleName: "CreateProductAPI",
  schema: CreateProductSchema,
  requiresAuth: {
    status: true,
    permission: "CREATE_PRODUCT",
  },
  handler: async (body: CreateProductInput, session: any, logger: any) => {
    return await CreateProduct(body, session, logger);
  },
});

export const GET = CreateApiRoute({
  moduleName: "FetchProductsAPI",
  schema: FetchProductsSchema,
  requiresAuth: {
    status: true,
    permission: "FETCH_PRODUCTS",
  },
  handler: async (req: FetchProductsInput) => {
    return await FetchProducts(req);
  },
});
