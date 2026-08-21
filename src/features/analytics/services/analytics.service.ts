import { prisma } from "@/lib/prisma";

export async function GetDashboardAnalytics(
  timeframe: "WEEK" | "MONTH" | "YEAR" = "WEEK",
) {
  // 1. Fetch Products & Stocks
  const products = await prisma.product.findMany({
    include: {
      category: true,
      stocks: true,
    },
  });

  // 2. Determine Date Range Filter
  const now = new Date();
  let startDate = new Date();
  if (timeframe === "WEEK") {
    startDate.setDate(now.getDate() - 7);
  } else if (timeframe === "MONTH") {
    startDate.setDate(now.getDate() - 30);
  } else if (timeframe === "YEAR") {
    startDate.setFullYear(now.getFullYear() - 1);
  }

  // 3. Fetch Sales Transactions within timeframe
  const sales = await prisma.transaction.findMany({
    where: {
      type: "SOLD",
      createdAt: { gte: startDate },
    },
    include: {
      stocks: {
        include: {
          products: {
            include: { category: true },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // 4. Fetch Losses
  const losses = await prisma.transaction.findMany({
    where: {
      OR: [{ type: "DEFECTIVE" }, { type: "ADJUSTMENT_LOSS" }],
      createdAt: { gte: startDate },
    },
    include: { stocks: true },
  });

  // 5. Total Financials
  const totalRevenue = sales.reduce((acc, s) => acc + s.price, 0);
  const totalCostOfSold = sales.reduce(
    (acc, s) => acc + s.quantity * (s.stocks?.costPrice || 0),
    0,
  );
  const grossProfit = totalRevenue - totalCostOfSold;
  const grossMarginPercentage =
    totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  const roi = totalCostOfSold > 0 ? (grossProfit / totalCostOfSold) * 100 : 0;

  // 6. Stock Asset Valuation
  const allStocks = products.flatMap((p) => p.stocks);
  const currentStockValue = allStocks.reduce(
    (acc, s) => acc + s.quantity * s.costPrice,
    0,
  );
  const potentialRevenue = allStocks.reduce(
    (acc, s) => acc + s.quantity * s.sellingPrice,
    0,
  );

  const turnoverRate =
    currentStockValue > 0 ? totalCostOfSold / currentStockValue : 0;
  const stockToSalesRatio =
    totalRevenue > 0 ? currentStockValue / totalRevenue : 0;

  // 7. Time-Series Aggregation for Timeline Graphs
  const timelineMap = new Map<
    string,
    {
      label: string;
      date: string;
      revenue: number;
      profit: number;
      cost: number;
      stockValue: number;
      potentialRevenue: number;
    }
  >();

  // Initialize Timeline intervals
  const steps = timeframe === "WEEK" ? 7 : timeframe === "MONTH" ? 30 : 12;
  for (let i = steps - 1; i >= 0; i--) {
    const d = new Date();
    if (timeframe === "WEEK" || timeframe === "MONTH") {
      d.setDate(now.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString(undefined, {
        weekday: "short",
        month: "numeric",
        day: "numeric",
      });
      timelineMap.set(key, {
        label,
        date: key,
        revenue: 0,
        profit: 0,
        cost: 0,
        stockValue: currentStockValue,
        potentialRevenue,
      });
    } else {
      d.setMonth(now.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString(undefined, {
        month: "short",
        year: "2-digit",
      });
      timelineMap.set(key, {
        label,
        date: key,
        revenue: 0,
        profit: 0,
        cost: 0,
        stockValue: currentStockValue,
        potentialRevenue,
      });
    }
  }

  // Populate sales into timeline buckets
  for (const s of sales) {
    const saleDate = new Date(s.createdAt);
    const key =
      timeframe === "YEAR"
        ? `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, "0")}`
        : saleDate.toISOString().split("T")[0];

    const bucket = timelineMap.get(key);
    if (bucket) {
      const cost = s.quantity * (s.stocks?.costPrice || 0);
      bucket.revenue += s.price;
      bucket.cost += cost;
      bucket.profit += s.price - cost;
    }
  }

  const timeline = Array.from(timelineMap.values());

  // 8. Category Breakdown
  const categoryMap = new Map<
    string,
    {
      categoryId: string;
      categoryName: string;
      revenue: number;
      quantity: number;
    }
  >();

  for (const sale of sales) {
    const cat = sale.stocks?.products?.category;
    if (!cat) continue;

    const existing = categoryMap.get(cat.id) || {
      categoryId: cat.id,
      categoryName: cat.name,
      revenue: 0,
      quantity: 0,
    };
    existing.revenue += sale.price;
    existing.quantity += sale.quantity;
    categoryMap.set(cat.id, existing);
  }

  // 9. Per-Item Analytics
  const itemPerformance = products.map((product) => {
    const pSales = sales.filter((s) => s.stocks?.productId === product.id);
    const unitsSold = pSales.reduce((acc, s) => acc + s.quantity, 0);
    const revenue = pSales.reduce((acc, s) => acc + s.price, 0);
    const costOfGoods = pSales.reduce(
      (acc, s) => acc + s.quantity * (s.stocks?.costPrice || 0),
      0,
    );
    const profit = revenue - costOfGoods;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    const currentStock = product.stocks.reduce((acc, s) => acc + s.quantity, 0);

    let status = "HEALTHY";
    if (currentStock === 0 && unitsSold > 0) status = "OUT_OF_STOCK";
    else if (currentStock > 0 && currentStock < 5) status = "LOW_STOCK";
    else if (currentStock > 20 && unitsSold === 0) status = "DEAD_STOCK";

    return {
      productId: product.id,
      name: product.name,
      sku: product.sku || "N/A",
      categoryName: product.category?.name || "Unassigned",
      unitsSold,
      revenue,
      costOfGoods,
      grossProfit: profit,
      marginPercentage: margin,
      currentStock,
      status,
    };
  });

  // 10. Best Sellers & Low Stock
  const bestSellers = [...itemPerformance]
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 5)
    .map((i) => ({
      productId: i.productId,
      name: i.name,
      sku: i.sku,
      quantity: i.unitsSold,
      revenue: i.revenue,
    }));

  const lowStockItems = products
    .map((p) => ({
      id: p.id,
      productId: p.id,
      productName: p.name,
      sku: p.sku || "N/A",
      quantity: p.stocks.reduce((acc, s) => acc + s.quantity, 0),
    }))
    .filter((p) => p.quantity > 0 && p.quantity < 5);

  const bestValueItems = allStocks
    .filter((s) => s.quantity > 0)
    .map((stock) => {
      const product = products.find((p) => p.id === stock.productId);
      const markupPercentage =
        stock.costPrice > 0
          ? ((stock.sellingPrice - stock.costPrice) / stock.costPrice) * 100
          : 0;
      return {
        stockId: stock.id,
        productId: stock.productId,
        productName: product?.name || "Unknown",
        markupPercentage,
        sellingPrice: stock.sellingPrice,
        costPrice: stock.costPrice,
      };
    })
    .sort((a, b) => b.markupPercentage - a.markupPercentage)
    .slice(0, 5);

  return {
    health: {
      turnoverRate,
      stockToSalesRatio,
      lowStockWarningCount: lowStockItems.length,
      outOfStockCount: products.filter(
        (p) => p.stocks.reduce((acc, s) => acc + s.quantity, 0) === 0,
      ).length,
    },
    performance: {
      totalRevenue,
      totalCostOfSold,
      grossProfit,
      grossMarginPercentage,
      currentStockValue,
      potentialRevenue,
      roi,
    },
    timeline,
    categorySales: Array.from(categoryMap.values()),
    lowStockItems,
    bestSellers,
    bestValueItems,
    itemPerformance,
    defectMetrics: {
      totalLossValue: losses.reduce(
        (acc, l) => acc + l.quantity * (l.stocks?.costPrice || 0),
        0,
      ),
      defectCount: losses.filter((l) => l.type === "DEFECTIVE").length,
      adjustmentLossCount: losses.filter((l) => l.type === "ADJUSTMENT_LOSS")
        .length,
    },
  };
}
