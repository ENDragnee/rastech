import { z } from "zod";

export const CreateStockSchema = z.object({
  serialNumber: z.string().trim().optional().nullable(),
  batchNumber: z.string().trim().optional().nullable(),
  quantity: z.coerce
    .number()
    .int()
    .positive("Quantity must be a positive integer"),
  costPrice: z.coerce.number().min(0, "Cost price must be non-negative"),
  sellingPrice: z.coerce.number().min(0, "Selling price must be non-negative"),
  withVat: z.boolean().default(true),
  productId: z.string().min(1, "Product ID is required"),
});

export type CreateStockInput = z.infer<typeof CreateStockSchema>;

export const FetchStockSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z
    .enum(["createdAt", "costPrice", "sellingPrice", "quantity"])
    .default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().trim().optional(),
});

export type FetchStockInput = z.infer<typeof FetchStockSchema>;

export const UpdateStockSchema = z.object({
  serialNumber: z.string().trim().optional().nullable(),
  batchNumber: z.string().trim().optional().nullable(),
  quantity: z.coerce.number().int().positive().optional(),
  costPrice: z.coerce.number().min(0).optional(),
  sellingPrice: z.coerce.number().min(0).optional(),
  withVat: z.boolean().optional(),
  productId: z.string().min(1, "Product ID is required").optional(),
});

export type UpdateStockInput = z.infer<typeof UpdateStockSchema>;
