import z from "zod";

export const CreateProductSchema = z.object({
  name: z.string(),
  sku: z.string().min(3, "Minimum of 3 characters for SKU").optional(),
  description: z.string().optional().nullable(),
  categoryId: z.cuid2(),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;

export const UpdateProductSchema = z.object({
  name: z.string().optional(),
  sku: z.string().min(3, "Minimum of 3 characters for SKU").optional(),
  description: z.string().optional().nullable(),
  categoryId: z.cuid2().optional(),
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
