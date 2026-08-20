import { prisma } from "@/lib/prisma";
import { DynamicApiRouteInput } from "@/lib/schemas/dynmaic-route.schema";
import { ISession } from "@/types/next-auth";
import { Logger } from "pino";
import { NextResponse } from "next/server";

export async function DeleteRole(
  session: ISession,
  params: DynamicApiRouteInput | undefined,
  logger: Logger,
) {
  const id = params?.id;
  if (!id) {
    logger?.warn("Delete role requested without a role ID");
    return NextResponse.json({ error: "Role ID required" }, { status: 400 });
  }

  const { id: userId, userName } = session;

  const deletedRole = await prisma.$transaction(async (tx) => {
    const role = await tx.role.delete({
      where: { id },
    });

    await tx.log.create({
      data: {
        type: "DELETED_ROLE",
        severity: "WARNING",
        message: `User: ${userName} deleted role ${role.name}`,
        userId,
      },
    });

    return role;
  });

  logger.info({ id }, "Deleted role successfully");
  return deletedRole;
}
