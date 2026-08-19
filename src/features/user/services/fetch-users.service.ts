import { prisma } from "@/lib/prisma";
import { FetchUserInput } from "../schemas/user.schema";
import { Prisma } from "@/generated/prisma/client";

export async function FetchUsers(req: FetchUserInput) {
  const { page, limit, order, status, sort, search } = req;
  const offset = (page - 1) * limit;
  const whereClause: Prisma.UserWhereInput = {
    ...(search && {
      OR: [{ userName: { contains: search, mode: "insensitive" } }],
    }),
    ...(status === "ACTIVE" ? { isActive: true } : { isActive: false }),
  };

  try {
    const [users, count] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        skip: offset,
        take: limit,
        orderBy: { [sort]: order },
      }),
      prisma.user.count({
        where: whereClause,
      }),
    ]);
    const totalPages = Math.ceil(count / limit);

    return {
      data: users,
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
