import { z } from "zod";

export const ReportTypeEnum = z.enum([
  "STOCK_STATUS",
  "SALES_SUMMARY",
  "DEFECTS_LOSSES",
  "TAX_VAT",
  "WARRANTY_RMA",
  "CREDIT_LEDGER",
]);

export type ReportType = z.infer<typeof ReportTypeEnum>;

export const FetchReportSchema = z.object({
  type: ReportTypeEnum.default("STOCK_STATUS"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  categoryId: z.string().optional(),
});

export type FetchReportInput = z.infer<typeof FetchReportSchema>;
