import z from "zod";

export const CreateStockSchema = z.object({
  serialNumber: z.string().optional(),
  batchNumber: z.string().optional(),
  quantity: z.coerce.number().positive(),
  costPrice: z.coerce.number().positive(),
  sellingPrice: z.coerce.number().positive(),
  withVat: z.boolean().default(true),
  productId: z.cuid2(),
});

export type CreateStockInput = z.infer<typeof CreateStockSchema>;

export const FetchStockSchema = z.object({
  page: z.coerce.number().int().min(1).positive().default(1),
  limit: z.coerce.number().int().min(5).max(50).positive().default(10),
  sort: z
    .enum(["created_at", "costPrice", "sellingPrice"])
    .default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().min(2).optional(),
  // aggregate: z.boolean().default(false),
});

export type FetchStockInput = z.infer<typeof FetchStockSchema>;

export const UpdateStockSchema = z.object({
  serialNumber: z.string().optional(),
  batchNumber: z.string().optional(),
  quantity: z.coerce.number().positive().optional(),
  costPrice: z.coerce.number().positive().optional(),
  sellingPrice: z.coerce.number().positive().optional(),
  withVat: z.boolean().default(true).optional(),
  productId: z.cuid2().optional(),
});

export type UpdateStockInput = z.infer<typeof UpdateStockSchema>;
