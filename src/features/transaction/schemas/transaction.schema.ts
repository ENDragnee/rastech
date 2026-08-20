import z from "zod";

export const CreateTransactionSchema = z.object({
  type: z.enum([
    "SOLD",
    "PURCHASED",
    "RETURNED",
    "DEFECTIVE",
    "ADJUSTMENT_LOSS",
  ]),
  quantity: z.coerce.number().positive(),
  price: z.coerce.number().positive(),
  stockId: z.string(),
});

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;

export const FetchTransactionSchema = z.object({
  page: z.coerce.number().int().min(1).positive().default(1),
  limit: z.coerce.number().int().min(5).max(50).positive().default(10),
  sort: z.enum(["createdAt", "type", "quantity", "price"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().min(2).optional(),
});

export type FetchTransactionInput = z.infer<typeof FetchTransactionSchema>;
