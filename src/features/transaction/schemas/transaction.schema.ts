import { z } from "zod";

export const CreateTransactionSchema = z.object({
  type: z.enum(
    ["SOLD", "RETURNED", "DEFECTIVE", "PURCHASED", "ADJUSTMENT_LOSS"],
    {
      error: "Invalid transaction type",
    },
  ),
  stockId: z.string().min(1, "Stock ID is required"),
  quantity: z.coerce.number().int().positive("Quantity must be greater than 0"),
  price: z.coerce.number().min(0, "Price must be greater than or equal to 0"),

  paymentMethod: z
    .enum(["CASH", "CARD", "TRANSFER", "ADJUSTMENT_LOSS"])
    .optional(),
  customerName: z.string().trim().optional(),
  customerPhone: z.string().trim().optional(),

  originalTransactionId: z.string().optional(),
  reason: z.string().trim().optional(),
});

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;

export const FetchTransactionSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  order: z.enum(["asc", "desc"]).default("desc"),
  sort: z.enum(["createdAt", "price", "quantity"]).default("createdAt"),
  search: z.string().trim().optional(),
  type: z
    .enum(["SOLD", "PURCHASED", "RETURNED", "DEFECTIVE", "ADJUSTMENT_LOSS"])
    .optional(),
  userId: z.string().optional(),
});

export type FetchTransactionInput = z.infer<typeof FetchTransactionSchema>;
