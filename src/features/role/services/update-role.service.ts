import { prisma } from "@/lib/prisma";
import { UpdateRoleInput } from "../schemas/role.schema";
import { DynamicApiRouteInput } from "@/lib/schemas/dynmaic-route.schema";
import { ISession } from "@/types/next-auth";
import { Logger } from "pino";
import { NextResponse } from "next/server";

export async function UpdateRole(
  body: UpdateRoleInput,
  session: ISession,
  params: DynamicApiRouteInput | undefined,
  logger: Logger,
) {
  const id = params?.id;
  if (!id) {
    logger?.warn("Update role requested without a role ID");
    return NextResponse.json({ error: "Role ID required" }, { status: 400 });
  }

  const { name, guardName, permissions } = body;
  const { id: userId, userName } = session;

  const updatedRole = await prisma.$transaction(async (tx) => {
    await tx.log.create({
      data: {
        type: "UPDATED_ROLE",
        severity: "INFO",
        message: `User: ${userName} updated role ${id}`,
        userId,
      },
    });

    return await tx.role.update({
      where: { id },
      data: {
        ...(name != null && { name }),
        ...(guardName != null && { guardName }),
        ...(permissions != null && {
          permissions: {
            set: permissions.map((pid) => ({ id: pid })),
          },
        }),
      },
    });
  });

  logger.info({ id }, "Updated role successfully");
  return updatedRole;
}
