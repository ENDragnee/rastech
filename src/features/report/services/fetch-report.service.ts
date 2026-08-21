import { prisma } from "@/lib/prisma";
import { FetchReportInput } from "../schemas/report.schema";

export async function FetchReportData(req: FetchReportInput) {
  const { type, startDate, endDate, categoryId } = req;

  // Date filters
  const dateFilter = {
    ...(startDate && { gte: new Date(startDate) }),
    ...(endDate && {
      lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
    }),
  };
  const hasDateFilter = startDate || endDate;

  // Category filter
  const categoryClause =
    categoryId && categoryId !== "ALL" ? { categoryId } : {};

  // 1. Stock Status Report
  if (type === "STOCK_STATUS") {
    const stocks = await prisma.stock.findMany({
      where: {
        products: categoryClause,
      },
      include: {
        products: {
          include: { category: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalCostValue = stocks.reduce(
      (acc, s) => acc + s.quantity * s.costPrice,
      0,
    );
    const totalPotentialValue = stocks.reduce(
      (acc, s) => acc + s.quantity * s.sellingPrice,
      0,
    );
    const totalUnits = stocks.reduce((acc, s) => acc + s.quantity, 0);

    return {
      type,
      summary: {
        totalCostValue,
        totalPotentialValue,
        projectedProfit: totalPotentialValue - totalCostValue,
        totalUnits,
        totalRecords: stocks.length,
      },
      rows: stocks.map((s) => ({
        id: s.id,
        identifier: s.serialNumber
          ? `SN: ${s.serialNumber}`
          : `Batch: ${s.batchNumber || "Unassigned"}`,
        productName: s.products.name,
        sku: s.products.sku || "—",
        category: s.products.category?.name || "Unassigned",
        quantity: s.quantity,
        costPrice: s.costPrice,
        sellingPrice: s.sellingPrice,
        totalCost: s.quantity * s.costPrice,
        totalValue: s.quantity * s.sellingPrice,
        withVat: s.withVat,
        warrantyDays: s.products.warrantyDays || 0,
      })),
    };
  }

  // 2. Sales Summary Report
  if (type === "SALES_SUMMARY") {
    const sales = await prisma.transaction.findMany({
      where: {
        type: "SOLD",
        ...(hasDateFilter && { createdAt: dateFilter }),
        stocks: {
          products: categoryClause,
        },
      },
      include: {
        stocks: {
          include: {
            products: { include: { category: true } },
          },
        },
        users: {
          select: { name: true, userName: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalRevenue = sales.reduce((acc, s) => acc + s.price, 0);
    const totalCost = sales.reduce(
      (acc, s) => acc + s.quantity * (s.stocks?.costPrice || 0),
      0,
    );

    return {
      type,
      summary: {
        totalRevenue,
        totalCost,
        grossProfit: totalRevenue - totalCost,
        marginPercent:
          totalRevenue > 0
            ? ((totalRevenue - totalCost) / totalRevenue) * 100
            : 0,
        totalUnitsSold: sales.reduce((acc, s) => acc + s.quantity, 0),
        totalTransactions: sales.length,
      },
      rows: sales.map((s) => ({
        invoiceNumber: s.invoiceNumber,
        date: s.createdAt,
        productName: s.stocks?.products?.name || "N/A",
        sku: s.stocks?.products?.sku || "—",
        serialNumber: s.stocks?.serialNumber || "—",
        quantity: s.quantity,
        salePrice: s.price,
        costPrice: s.stocks?.costPrice || 0,
        grossProfit: s.price - s.quantity * (s.stocks?.costPrice || 0),
        paymentMethod: s.paymentMethod || "CASH",
        customerName: s.customerName || "Walk-in",
        processedBy: s.users?.userName || "System",
      })),
    };
  }

  // 3. Defects & Losses Report
  if (type === "DEFECTS_LOSSES") {
    const losses = await prisma.transaction.findMany({
      where: {
        OR: [
          { type: "DEFECTIVE" },
          { type: "ADJUSTMENT_LOSS" },
          { type: "RETURNED" },
        ],
        ...(hasDateFilter && { createdAt: dateFilter }),
      },
      include: {
        stocks: {
          include: {
            products: true,
          },
        },
        users: { select: { userName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalLossValue = losses
      .filter((l) => l.type === "DEFECTIVE" || l.type === "ADJUSTMENT_LOSS")
      .reduce((acc, l) => acc + l.quantity * (l.stocks?.costPrice || 0), 0);

    return {
      type,
      summary: {
        totalLossValue,
        defectCount: losses.filter((l) => l.type === "DEFECTIVE").length,
        shrinkageCount: losses.filter((l) => l.type === "ADJUSTMENT_LOSS")
          .length,
        returnCount: losses.filter((l) => l.type === "RETURNED").length,
      },
      rows: losses.map((l) => ({
        reference: l.invoiceNumber,
        date: l.createdAt,
        type: l.type,
        productName: l.stocks?.products?.name || "Hardware Item",
        sku: l.stocks?.products?.sku || "—",
        serialNumber: l.stocks?.serialNumber || "—",
        quantity: l.quantity,
        lossValue: l.quantity * (l.stocks?.costPrice || 0),
        customerName: l.customerName || "—",
        processedBy: l.users?.userName || "System",
      })),
    };
  }

  // 4. Tax / VAT Ledger Report
  if (type === "TAX_VAT") {
    const sales = await prisma.transaction.findMany({
      where: {
        type: "SOLD",
        ...(hasDateFilter && { createdAt: dateFilter }),
      },
      include: {
        stocks: {
          include: { products: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const vatSales = sales.filter((s) => s.stocks?.withVat);
    const nonVatSales = sales.filter((s) => !s.stocks?.withVat);

    const totalVatGross = vatSales.reduce((acc, s) => acc + s.price, 0);
    const totalNonVatGross = nonVatSales.reduce((acc, s) => acc + s.price, 0);

    // Standard 15% VAT portion: Gross / 1.15 * 0.15
    const totalVatLiability = (totalVatGross / 1.15) * 0.15;
    const netTaxableRevenue = totalVatGross - totalVatLiability;

    return {
      type,
      summary: {
        totalGrossSales: totalVatGross + totalNonVatGross,
        totalVatGross,
        totalNonVatGross,
        totalVatLiability,
        netTaxableRevenue,
      },
      rows: sales.map((s) => {
        const withVat = s.stocks?.withVat ?? false;
        const vatAmount = withVat ? (s.price / 1.15) * 0.15 : 0;
        return {
          invoiceNumber: s.invoiceNumber,
          date: s.createdAt,
          productName: s.stocks?.products?.name || "Product",
          grossPrice: s.price,
          isVat: withVat ? "VAT (15%)" : "Exempt",
          netAmount: s.price - vatAmount,
          vatAmount,
          customerName: s.customerName || "Walk-in",
        };
      }),
    };
  }

  // 5. Warranty & RMA Report
  const sales = await prisma.transaction.findMany({
    where: {
      type: "SOLD",
      warrantyEndsAt: { not: null },
      ...(hasDateFilter && { createdAt: dateFilter }),
    },
    include: {
      stocks: {
        include: { products: true },
      },
    },
    orderBy: { warrantyEndsAt: "asc" },
  });

  const now = new Date();
  const activeWarranties = sales.filter(
    (s) => s.warrantyEndsAt && new Date(s.warrantyEndsAt) > now,
  );
  const expiredWarranties = sales.filter(
    (s) => s.warrantyEndsAt && new Date(s.warrantyEndsAt) <= now,
  );

  return {
    type: "WARRANTY_RMA",
    summary: {
      totalRegistered: sales.length,
      activeCount: activeWarranties.length,
      expiredCount: expiredWarranties.length,
    },
    rows: sales.map((s) => ({
      invoiceNumber: s.invoiceNumber,
      productName: s.stocks?.products?.name || "Hardware",
      serialNumber: s.stocks?.serialNumber || "—",
      customerName: s.customerName || "Walk-in",
      customerPhone: s.customerPhone || "N/A",
      saleDate: s.createdAt,
      warrantyEndsAt: s.warrantyEndsAt,
      status:
        s.warrantyEndsAt && new Date(s.warrantyEndsAt) > now
          ? "Active"
          : "Expired",
    })),
  };
}
