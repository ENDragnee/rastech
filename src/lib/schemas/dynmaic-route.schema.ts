import z from "zod";

export const DynamicApiRouteSchema = z.object({
  id: z.cuid2(),
});

export type DynamicApiRouteInput = z.infer<typeof DynamicApiRouteSchema>;
