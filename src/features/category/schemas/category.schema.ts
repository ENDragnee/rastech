import z from "zod";

export const CreateCategorySchema = z.object({
  name: z.string().min(3, "The minium number of characters needed is 3"),
  description: z.string().optional(),
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;

export const UpdateCategorySchema = z.object({
  name: z
    .string()
    .min(3, "The minium number of characters needed is 3")
    .optional(),
  description: z.string().optional(),
});

export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
