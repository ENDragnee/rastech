import { prisma } from "@/lib/prisma";
import { FetchLogInput } from "../schemas/log.schema";
import { Prisma } from "@/generated/prisma/client";

export async function FetchLogs(req: FetchLogInput) {
  const { page, limit, order, sort, search } = req;
  const offset = (page - 1) * limit;

  const whereClause: Prisma.LogWhereInput = {
    ...(search && {
      OR: [
        { message: { contains: search, mode: "insensitive" } },
        { type: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  try {
    const [logs, count] = await prisma.$transaction([
      prisma.log.findMany({
        where: whereClause,
        skip: offset,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          user: {
            select: {
              name: true,
              userName: true,
            }
          }
        }
      }),
      prisma.log.count({
        where: whereClause,
      }),
    ]);
    
    const totalPages = Math.ceil(count / limit);

    return {
      data: logs,
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
