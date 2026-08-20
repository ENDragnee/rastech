import { prisma } from "@/lib/prisma";
import { FetchReportInput } from "../schemas/report.schema";

export async function FetchReport(req: FetchReportInput) {
  const { startDate, endDate, categoryId, type } = req;

  const dateFilter = {
    ...(startDate && { gte: new Date(startDate) }),
    ...(endDate && { lte: new Date(endDate) }),
  };

  try {
    if (type === "STOCK_STATUS") {
      const stocks = await prisma.stock.findMany({
        where: {
          ...(categoryId && { products: { categoryId } }),
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
        },
        include: {
          products: {
            include: { category: true },
          },
          history: {
            where: {
              ...(Object.keys(dateFilter).length > 0 && {
                createdAt: dateFilter,
              }),
            },
          },
        },
        orderBy: { quantity: "desc" },
      });

      return {
        type,
        summary: {
          totalItems: stocks.length,
          totalValue: stocks.reduce(
            (acc, s) => acc + s.quantity * s.costPrice,
            0,
          ),
          potentialValue: stocks.reduce(
            (acc, s) => acc + s.quantity * s.sellingPrice,
            0,
          ),
        },
        data: stocks.map((s) => ({
          stockId: s.id,
          productName: s.products.name,
          sku: s.products.sku,
          category: s.products.category.name,
          currentQuantity: s.quantity,
          sellingPrice: s.sellingPrice,
          costPrice: s.costPrice,
          totalValue: s.quantity * s.costPrice,
          potentialValue: s.quantity * s.sellingPrice,
          transactionsCount: s.history.length,
        })),
      };
    }

    if (type === "SALES_SUMMARY") {
      const transactions = await prisma.transaction.findMany({
        where: {
          type: "SOLD",
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
          ...(categoryId && { stocks: { products: { categoryId } } }),
        },
        include: {
          stocks: {
            include: { products: { include: { category: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return {
        type,
        summary: {
          totalTransactions: transactions.length,
          totalRevenue: transactions.reduce(
            (acc, t) => acc + t.quantity * t.price,
            0,
          ),
          totalProfit: transactions.reduce(
            (acc, t) => acc + (t.price - t.stocks.costPrice) * t.quantity,
            0,
          ),
        },
        data: transactions.map((t) => ({
          transactionId: t.id,
          invoiceNumber: t.invoiceNumber,
          date: t.createdAt,
          productName: t.stocks.products.name,
          category: t.stocks.products.category.name,
          quantitySold: t.quantity,
          pricePerUnit: t.price,
          totalRevenue: t.quantity * t.price,
          costPerUnit: t.stocks.costPrice,
          profit: (t.price - t.stocks.costPrice) * t.quantity,
        })),
      };
    }

    if (type === "DEFECTS") {
      const defects = await prisma.transaction.findMany({
        where: {
          type: "DEFECTIVE",
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
          ...(categoryId && { stocks: { products: { categoryId } } }),
        },
        include: {
          stocks: {
            include: { products: { include: { category: true } } },
          },
          users: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return {
        type,
        summary: {
          totalDefectRecords: defects.length,
          totalLossValue: defects.reduce(
            (acc, d) => acc + d.quantity * d.stocks.costPrice,
            0,
          ),
        },
        data: defects.map((d) => ({
          transactionId: d.id,
          date: d.createdAt,
          productName: d.stocks.products.name,
          category: d.stocks.products.category.name,
          quantityDefective: d.quantity,
          lossValue: d.quantity * d.stocks.costPrice,
          reportedBy: d.users?.name || "Unknown",
        })),
      };
    }

    return { type, data: [] };
  } catch (err: any) {
    throw err;
  }
}
