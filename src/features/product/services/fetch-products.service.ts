import { prisma } from "@/lib/prisma";
import { FetchProductsInput } from "../schemas/product.schema";
import { Prisma } from "@/generated/prisma/client";

export async function FetchProducts(req: FetchProductsInput) {
  const { page, limit, order, sort, search } = req;
  const offset = (page - 1) * limit;
  const whereClause: Prisma.ProductWhereInput = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  try {
    const [products, count] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        skip: offset,
        take: limit,
        orderBy: { [sort]: order },
      }),
      prisma.product.count({
        where: whereClause,
      }),
    ]);
    const totalPages = Math.ceil(count / limit);

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
