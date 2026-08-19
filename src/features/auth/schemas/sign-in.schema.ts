import z from "zod";

export const UserNameSignInSchema = z.object({
  userName: z.string().min(3),
  password: z.string(),
});

export type userNameSignInInput = z.infer<typeof UserNameSignInSchema>;
