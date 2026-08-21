import { z } from "zod";

export const LogSeverityEnum = z.enum(["INFO", "WARNING", "ERROR", "FATAL"]);
export type LogSeverity = z.infer<typeof LogSeverityEnum>;

export const FetchLogSchema = z.object({
  page: z.coerce.number().int().min(1).positive().default(1),
  limit: z.coerce.number().int().min(5).max(100).positive().default(20),
  sort: z.enum(["createdAt", "type", "severity"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().trim().optional(),
  severity: LogSeverityEnum.optional(),
  type: z.string().trim().optional(),
  userId: z.string().trim().optional(),
  startDate: z.string().trim().optional(),
  endDate: z.string().trim().optional(),
});

export type FetchLogInput = z.infer<typeof FetchLogSchema>;
