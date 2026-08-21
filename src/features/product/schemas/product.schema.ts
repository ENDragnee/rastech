import { z } from "zod";

export const CreateProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().min(3, "Minimum of 3 characters for SKU"),
  description: z.string().optional().nullable(),
  categoryId: z.string().min(1, "Valid Category ID is required"),
  warrantyDays: z.coerce.number().int().min(0).default(0).optional(),
  withVat: z.boolean().default(true).optional(),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;

export const UpdateProductSchema = z.object({
  name: z.string().min(1).optional(),
  sku: z.string().min(3, "Minimum of 3 characters for SKU").optional(),
  description: z.string().optional().nullable(),
  categoryId: z.string().min(1, "Valid Category ID is required").optional(),
  warrantyDays: z.coerce.number().int().min(0).optional(),
  withVat: z.boolean().optional(),
});

export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;

export const FetchProductsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  order: z.enum(["asc", "desc"]).default("desc"),
  sort: z.enum(["createdAt", "name", "sku"]).default("createdAt"),
  search: z.string().trim().optional(),
  categoryId: z.string().trim().optional(),
});

export type FetchProductsInput = z.infer<typeof FetchProductsSchema>;
