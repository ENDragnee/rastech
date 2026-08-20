import { prisma } from "@/lib/prisma";

export async function GetDashboardAnalytics() {
  const totalStocks = await prisma.stock.count();
  const totalProducts = await prisma.product.count();

  const sales = await prisma.transaction.findMany({
    where: { type: "SOLD" },
    include: {
      stocks: {
        include: {
          products: true
        }
      }
    }
  });

  const totalRevenue = sales.reduce((acc, sale) => acc + (sale.quantity * sale.price), 0);
  const totalCostOfSold = sales.reduce((acc, sale) => acc + (sale.quantity * sale.stocks.costPrice), 0);
  
  const grossMarginPercentage = totalRevenue > 0 ? ((totalRevenue - totalCostOfSold) / totalRevenue) * 100 : 0;
  const roi = totalCostOfSold > 0 ? ((totalRevenue - totalCostOfSold) / totalCostOfSold) * 100 : 0;
  
  const currentStocks = await prisma.stock.findMany({
    include: {
      products: true
    }
  });

  const currentStockValue = currentStocks.reduce((acc, stock) => acc + (stock.quantity * stock.costPrice), 0);
  const potentialRevenue = currentStocks.reduce((acc, stock) => acc + (stock.quantity * stock.sellingPrice), 0);
  
  // Stock Turnover Rate = Cost of Goods Sold / Average Inventory
  const turnoverRate = currentStockValue > 0 ? (totalCostOfSold / currentStockValue) : 0;
  
  const stockToSalesRatio = totalRevenue > 0 ? (currentStockValue / totalRevenue) : 0;

  const lowStockItems = currentStocks
    .filter(s => s.quantity > 0 && s.quantity < 5)
    .map(s => ({
      id: s.id,
      quantity: s.quantity,
      productName: s.products.name,
      productId: s.productId
    }));

  const productSales = new Map<string, { quantity: number, revenue: number, name: string }>();
  for (const sale of sales) {
    const key = sale.stocks.productId;
    const current = productSales.get(key) || { quantity: 0, revenue: 0, name: sale.stocks.products.name };
    productSales.set(key, {
      quantity: current.quantity + sale.quantity,
      revenue: current.revenue + (sale.quantity * sale.price),
      name: current.name
    });
  }
  
  const bestSellers = Array.from(productSales.entries())
    .map(([productId, data]) => ({ productId, ...data }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const bestValueItems = currentStocks
    .filter(s => s.quantity > 0)
    .map(stock => {
      const markupPercentage = stock.costPrice > 0 ? ((stock.sellingPrice - stock.costPrice) / stock.costPrice) * 100 : 0;
      return {
        stockId: stock.id,
        productId: stock.productId,
        productName: stock.products.name,
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
    },
    performance: {
      totalRevenue,
      totalCostOfSold,
      grossMarginPercentage,
      currentStockValue,
      potentialRevenue,
      roi,
    },
    indicators: {
      lowStockItems,
    },
    bestSellers,
    bestValueItems,
  };
}
