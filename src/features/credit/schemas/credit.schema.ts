import { z } from "zod";

export const CreateCreditSchema = z.object({
  stockId: z.string().min(1, "Stock item is required"),
  quantity: z.coerce.number().int().positive("Quantity must be at least 1"),
  totalAmount: z.coerce.number().min(0, "Total amount cannot be negative"),
  customerName: z.string().trim().min(1, "Customer name is required"),
  customerPhone: z.string().trim().optional().nullable(), // <-- Optional
  customerIdDoc: z.string().trim().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
});

export type CreateCreditInput = z.infer<typeof CreateCreditSchema>;

export const UpdateCreditSchema = z.object({
  status: z.enum(["PENDING", "PAID", "RETURNED", "DEFAULTED"]),
  dueDate: z.string().datetime().optional().nullable(),
  notes: z.string().trim().optional(),
});

export type UpdateCreditInput = z.infer<typeof UpdateCreditSchema>;

export const FetchCreditSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  order: z.enum(["asc", "desc"]).default("desc"),
  sort: z.enum(["createdAt", "dueDate", "totalAmount"]).default("createdAt"),
  search: z.string().trim().optional(),
  status: z.enum(["PENDING", "PAID", "RETURNED", "DEFAULTED"]).optional(),
  overdueOnly: z.enum(["true", "false"]).optional(),
});

export type FetchCreditInput = z.infer<typeof FetchCreditSchema>;
