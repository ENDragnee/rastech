import { prisma } from "@/lib/prisma";
import { FetchStockInput } from "../schemas/stock.schema";
import { Prisma } from "@/generated/prisma/client";

export async function FetchStocks(req: FetchStockInput) {
  const { page, limit, order, sort, search } = req;
  const offset = (page - 1) * limit;
  const whereClause: Prisma.StockWhereInput = {
    ...(search && {
      OR: [
        {
          products: {
            name: { contains: search, mode: "insensitive" },
            sku: { contains: search, mode: "insensitive" },
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
      }),
      prisma.stock.count({
        where: whereClause,
      }),
    ]);
    const totalPages = Math.ceil(count / limit);

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
