import z from "zod";

export const FetchReportSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  categoryId: z.string().optional(),
  type: z.enum(["STOCK_STATUS", "SALES_SUMMARY", "DEFECTS"]).default("STOCK_STATUS"),
});

export type FetchReportInput = z.infer<typeof FetchReportSchema>;
