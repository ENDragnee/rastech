import { prisma } from "@/lib/prisma";

export async function FetchModulesWithPermissions() {
  return await prisma.module.findMany({
    where: { isActive: true },
    include: {
      permissions: {
        select: {
          id: true,
          name: true,
          guardName: true,
        },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });
}
