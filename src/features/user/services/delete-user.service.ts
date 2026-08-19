import { prisma } from "@/lib/prisma";
import { DynamicApiRouteInput } from "@/lib/schemas/dynmaic-route.schema";
import { ISession } from "@/types/next-auth";
import { Logger } from "pino";
import { NextResponse } from "next/server";

export async function DeleteUser(
  session: ISession,
  params: DynamicApiRouteInput | undefined,
  logger: Logger,
) {
  const userId = params?.id;
  if (!userId) {
    logger?.warn("Update connection requested without a user ID");
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
      },
    });

    logger.info({ userId }, "User has been deleted successfully");

    await prisma.log.create({
      data: {
        type: "USER_DELETED",
        severity: "INFO",
        message: `User ${session.userName} has deleted user with id ${user.userName}`,
        userId: session.id,
      },
    });
  } catch (err) {
    throw err;
  }
}
