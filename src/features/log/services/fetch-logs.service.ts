import { prisma } from "@/lib/prisma";
import { FetchLogInput } from "../schemas/log.schema";
import { Prisma } from "@/generated/prisma/client";

export async function FetchLogs(req: FetchLogInput) {
  const {
    page,
    limit,
    order,
    sort,
    search,
    severity,
    type,
    userId,
    startDate,
    endDate,
  } = req;
  const offset = (page - 1) * limit;

  // 1. Date Range Handling
  let createdAtClause: Prisma.DateTimeFilter | undefined;
  if (startDate || endDate) {
    createdAtClause = {
      ...(startDate && { gte: new Date(startDate) }),
      ...(endDate && {
        lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      }),
    };
  }

  // 2. Build Where Clause
  const whereClause: Prisma.LogWhereInput = {
    ...(severity && { severity }),
    ...(type && { type: { contains: type, mode: "insensitive" } }),
    ...(userId && { userId }),
    ...(createdAtClause && { createdAt: createdAtClause }),
    ...(search && {
      OR: [
        { message: { contains: search, mode: "insensitive" } },
        { type: { contains: search, mode: "insensitive" } },
        { targetName: { contains: search, mode: "insensitive" } },
        { targetId: { contains: search, mode: "insensitive" } },
        { ipAddress: { contains: search, mode: "insensitive" } },
        {
          user: {
            OR: [
              { userName: { contains: search, mode: "insensitive" } },
              { name: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ],
    }),
  };

  try {
    // 3. Execute Logs Query + Aggregation Stats in a Single Atomic Transaction
    const [logs, count, infoCount, warningCount, errorCount, fatalCount] =
      await prisma.$transaction([
        prisma.log.findMany({
          where: whereClause,
          skip: offset,
          take: limit,
          orderBy: { [sort]: order },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                userName: true,
              },
            },
          },
        }),
        prisma.log.count({ where: whereClause }),
        prisma.log.count({ where: { ...whereClause, severity: "INFO" } }),
        prisma.log.count({ where: { ...whereClause, severity: "WARNING" } }),
        prisma.log.count({ where: { ...whereClause, severity: "ERROR" } }),
        prisma.log.count({ where: { ...whereClause, severity: "FATAL" } }),
      ]);

    const totalPages = Math.ceil(count / limit) || 1;

    return {
      data: logs,
      stats: {
        total: count,
        info: infoCount,
        warning: warningCount,
        error: errorCount,
        fatal: fatalCount,
      },
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
