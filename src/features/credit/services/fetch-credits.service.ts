import { prisma } from "@/lib/prisma";
import { FetchCreditInput } from "../schemas/credit.schema";
import { Prisma } from "@/generated/prisma/client";

export async function FetchCredits(req: FetchCreditInput) {
  const { page, limit, order, sort, search, status, overdueOnly } = req;
  const offset = (page - 1) * limit;

  const now = new Date();

  const whereClause: Prisma.CreditWhereInput = {
    ...(status && { status }),
    ...(overdueOnly === "true" && {
      status: "PENDING",
      dueDate: { lt: now },
    }),
    ...(search && {
      OR: [
        { customerName: { contains: search, mode: "insensitive" } },
        { customerPhone: { contains: search, mode: "insensitive" } },
        { customerIdDoc: { contains: search, mode: "insensitive" } },
        {
          transaction: {
            invoiceNumber: { contains: search, mode: "insensitive" },
          },
        },
        {
          stock: {
            OR: [
              { serialNumber: { contains: search, mode: "insensitive" } },
              {
                products: {
                  name: { contains: search, mode: "insensitive" },
                },
              },
            ],
          },
        },
      ],
    }),
  };

  try {
    const [credits, count] = await prisma.$transaction([
      prisma.credit.findMany({
        where: whereClause,
        skip: offset,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          stock: {
            include: { products: true },
          },
          transaction: true,
          createdBy: {
            select: { name: true, userName: true },
          },
          approvedBy: {
            select: { name: true, userName: true },
          },
        },
      }),
      prisma.credit.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(count / limit) || 1;

    return {
      data: credits,
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
