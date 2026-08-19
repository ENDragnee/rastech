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
  page: z.coerce.number().int().min(1).positive().default(1),
  limit: z.coerce.number().int().min(5).max(50).positive().default(10),
  sort: z.enum(["created_at", "name", "sku"]).default("name"),
  order: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().min(2).optional(),
});

export type FetchProductsInput = z.infer<typeof FetchProductsSchema>;
