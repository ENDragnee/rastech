import { prisma } from "@/lib/prisma";
import { FetchRoleInput } from "../schemas/role.schema";
import { Prisma } from "@/generated/prisma/client";

export async function FetchRoles(req: FetchRoleInput) {
  const { page, limit, order, sort, search } = req;
  const offset = (page - 1) * limit;

  const whereClause: Prisma.RoleWhereInput = {
    ...(search && {
      OR: [{ name: { contains: search, mode: "insensitive" } }],
    }),
  };

  try {
    const [roles, count] = await prisma.$transaction([
      prisma.role.findMany({
        where: whereClause,
        skip: offset,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          permissions: true,
          _count: {
            select: { users: true },
          },
        },
      }),
      prisma.role.count({
        where: whereClause,
      }),
    ]);
    const totalPages = Math.ceil(count / limit);

    return {
      data: roles,
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
