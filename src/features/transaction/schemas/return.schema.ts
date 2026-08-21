import { z } from "zod";

export const ProcessReturnSchema = z.object({
  originalTransactionId: z
    .string()
    .min(1, "Original transaction ID is required"),
  type: z.enum(["RETURNED", "DEFECTIVE"]),
  quantity: z.coerce.number().int().positive("Quantity must be at least 1"),
  reason: z.string().trim().min(3, "Please provide a reason for the return"),
});

export type ProcessReturnInput = z.infer<typeof ProcessReturnSchema>;
