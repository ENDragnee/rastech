import { prisma } from "@/lib/prisma";
import { FetchStockInput } from "../schemas/stock.schema";
import { Prisma } from "@/generated/prisma/client";

export async function FetchStocks(req: FetchStockInput) {
  const { page, limit, order, sort, search } = req;
  const offset = (page - 1) * limit;
  const whereClause: Prisma.StockWhereInput = {
    ...(search && {
      OR: [
        { serialNumber: { contains: search, mode: "insensitive" } },
        { batchNumber: { contains: search, mode: "insensitive" } },
        {
          products: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { sku: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ],
    }),
  };

  try {
    const [stock, count] = await prisma.$transaction([
      prisma.stock.findMany({
        where: whereClause,
        skip: offset,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          products: {
            select: {
              id: true,
              name: true,
              sku: true,
              warrantyDays: true,
            },
          },
        },
      }),
      prisma.stock.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(count / limit) || 1;

    return {
      data: stock,
      meta: {
        total: count,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  } catch (err: any) {
    throw err;
  }
}
