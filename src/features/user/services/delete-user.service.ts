import { prisma } from "@/lib/prisma";
import { DynamicApiRouteInput } from "@/lib/schemas/dynmaic-route.schema";
import { ISession } from "@/types/next-auth";
import { Logger } from "pino";
import { NextResponse } from "next/server";

export async function DeleteUser(
  session: ISession,
  params: DynamicApiRouteInput | undefined,
  logger?: Logger,
) {
  const userId = params?.id;
  if (!userId) {
    logger?.warn("Deactivate requested without a user ID");
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  const { id: adminId, userName: adminUsername } = session;

  const user = await prisma.$transaction(async (tx) => {
    // 1. Soft-delete by setting isActive to false
    const deactivatedUser = await tx.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    // 2. Log after user is updated so deactivatedUser is accessible
    await tx.log.create({
      data: {
        type: "USER_DEACTIVATED",
        severity: "INFO",
        message: `Admin @${adminUsername} deactivated user @${deactivatedUser.userName}`,
        userId: adminId,
        targetId: deactivatedUser.id,
        targetName: deactivatedUser.name || deactivatedUser.userName,
      },
    });

    return deactivatedUser;
  });

  logger?.info({ userId }, "User has been deactivated successfully");
  return user;
}
