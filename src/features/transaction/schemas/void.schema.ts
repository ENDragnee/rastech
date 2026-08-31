import z from "zod";
export const VoidTransactionSchema = z.object({
  transactionId: z.string().min(1, "Transaction ID is required"),
  reason: z
    .string()
    .trim()
    .min(5, "A detailed cancellation reason is required"),
});
