import { prisma } from "@/lib/prisma";
import { FetchUserInput } from "../schemas/user.schema";
import { Prisma } from "@/generated/prisma/client";

export async function FetchUsers(req: FetchUserInput) {
  const { page, limit, order, status, sort, search } = req;
  const offset = (page - 1) * limit;

  const whereClause: Prisma.UserWhereInput = {
    ...(search && {
      OR: [
        { userName: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(status === "ACTIVE" ? { isActive: true } : { isActive: false }),
  };

  const sortKey = sort === "created_at" ? "createdAt" : sort;

  try {
    const [users, count] = await prisma.$transaction([
      prisma.user.findMany({
        where: whereClause,
        skip: offset,
        take: limit,
        orderBy: { [sortKey]: order },
        include: {
          roles: {
            select: {
              id: true,
              name: true,
              guardName: true,
            },
          },
          _count: {
            select: { transactions: true },
          },
        },
      }),
      prisma.user.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(count / limit) || 1;

    // 2. Sanitize and remove password hashes from client response
    const sanitizedUsers = users.map(({ password, ...user }) => user);

    return {
      data: sanitizedUsers,
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
