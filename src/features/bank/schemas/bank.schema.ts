import { z } from "zod";

export const CreateBankSchema = z.object({
  name: z.string().trim().min(2, "Bank name is required"),
  accountNumber: z
    .string()
    .trim()
    .regex(/^\d+$/, "Account number must be numeric")
    .optional()
    .nullable(),
});

export type CreateBankInput = z.infer<typeof CreateBankSchema>;

export const UpdateBankSchema = CreateBankSchema.partial();
export type UpdateBankInput = z.infer<typeof UpdateBankSchema>;

export const FetchBankSchema = z.object({
  search: z.string().trim().optional(),
});

export type FetchBankInput = z.infer<typeof FetchBankSchema>;
