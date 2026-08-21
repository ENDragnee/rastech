import { prisma } from "@/lib/prisma";
import { FetchProductsInput } from "../schemas/product.schema";
import { Prisma } from "@/generated/prisma/client";

export async function FetchProducts(req: FetchProductsInput) {
  const { page, limit, order, sort, search, categoryId } = req;
  const offset = (page - 1) * limit;

  const whereClause: Prisma.ProductWhereInput = {
    ...(categoryId &&
      categoryId !== "ALL" && {
        categoryId,
      }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  try {
    const [products, count] = await prisma.$transaction([
      prisma.product.findMany({
        where: whereClause,
        skip: offset,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          stocks: true, // Includes all serial numbers & batch stocks for accurate POS display
        },
      }),
      prisma.product.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(count / limit) || 1;

    return {
      data: products,
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
