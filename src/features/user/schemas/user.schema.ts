import z from "zod";

export const CreateUserSchema = z.object({
  name: z.string().optional().nullable(),
  userName: z.string().min(3, "The minimum username length is 3 characters"),
  passowrd: z.string(),
  isActive: z.boolean().default(true).optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = z.object({
  name: z.string().optional(),
  userName: z
    .string()
    .min(3, "The minimum username length is 3 characters")
    .optional(),
  passowrd: z.string().optional(),
  roleIds: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

export const FetchUsersSchema = z.object({
  page: z.coerce.number().int().min(1).positive().default(1),
  limit: z.coerce.number().int().min(5).max(50).positive().default(10),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional().default("ACTIVE"),
  sort: z.enum(["created_at", "name", "userName"]).default("userName"),
  order: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().min(2).optional(),
});

export type FetchUserInput = z.infer<typeof FetchUsersSchema>;
