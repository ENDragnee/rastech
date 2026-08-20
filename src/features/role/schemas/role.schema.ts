import z from "zod";

export const CreateRoleSchema = z.object({
  name: z.string().min(2),
  guardName: z.string().min(2).default("web"),
  permissions: z.array(z.string()).optional(), // Array of permission IDs
});

export type CreateRoleInput = z.infer<typeof CreateRoleSchema>;

export const UpdateRoleSchema = z.object({
  name: z.string().min(2).optional(),
  guardName: z.string().min(2).optional(),
  permissions: z.array(z.string()).optional(),
});

export type UpdateRoleInput = z.infer<typeof UpdateRoleSchema>;

export const FetchRoleSchema = z.object({
  page: z.coerce.number().int().min(1).positive().default(1),
  limit: z.coerce.number().int().min(5).max(50).positive().default(10),
  sort: z.enum(["createdAt", "name"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().min(2).optional(),
});

export type FetchRoleInput = z.infer<typeof FetchRoleSchema>;
