import { prisma } from "@/lib/prisma";
import { CreateRoleInput } from "../schemas/role.schema";
import { ISession } from "@/types/next-auth";
import { Logger } from "pino";

export async function CreateRole(
  body: CreateRoleInput,
  session: ISession,
  logger: Logger,
) {
  const { name, guardName, permissions } = body;
  const { id: userId, userName } = session;

  const role = await prisma.$transaction(async (tx) => {
    const newRole = await tx.role.create({
      data: {
        name,
        guardName,
        permissions: permissions
          ? {
              connect: permissions.map((id) => ({ id })),
            }
          : undefined,
      },
    });

    await tx.log.create({
      data: {
        type: "CREATED_ROLE",
        severity: "INFO",
        message: `User: ${userId} created role ${name}`,
        userId,
      },
    });

    return newRole;
  });

  logger.info({ roleId: role.id }, "Role created successfully");
  return role;
}
