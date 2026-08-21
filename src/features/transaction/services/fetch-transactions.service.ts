import { prisma } from "@/lib/prisma";
import { FetchTransactionInput } from "../schemas/transaction.schema";
import { Prisma } from "@/generated/prisma/client";

export async function FetchTransactions(req: FetchTransactionInput) {
  const { page, limit, order, sort, search, type, userId } = req;
  const offset = (page - 1) * limit;

  // Build filter conditions
  const whereClause: Prisma.TransactionWhereInput = {
    ...(type && { type }),
    ...(userId && { userId }),
    ...(search && {
      OR: [
        { invoiceNumber: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { customerPhone: { contains: search, mode: "insensitive" } },
        {
          stocks: {
            OR: [
              { serialNumber: { contains: search, mode: "insensitive" } },
              {
                products: {
                  OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { sku: { contains: search, mode: "insensitive" } },
                  ],
                },
              },
            ],
          },
        },
      ],
    }),
  };

  try {
    const [transactions, count] = await prisma.$transaction([
      prisma.transaction.findMany({
        where: whereClause,
        skip: offset,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          stocks: {
            include: {
              products: true,
            },
          },
          users: {
            select: {
              id: true,
              name: true,
              userName: true,
            },
          },
        },
      }),
      prisma.transaction.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(count / limit) || 1;

    return {
      data: transactions,
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
