import { prisma } from "@/lib/prisma";
import { DynamicApiRouteInput } from "@/lib/schemas/dynmaic-route.schema";
import { ISession } from "@/types/next-auth";
import { Logger } from "pino";
import { NextResponse } from "next/server";
import { UpdateUserInput } from "../schemas/user.schema";
import { HashPassword } from "@/lib/password-utils";

export async function UpdateUser(
  body: UpdateUserInput,
  session: ISession,
  params: DynamicApiRouteInput | undefined,
  logger: Logger,
) {
  const userId = params?.id;
  if (!userId) {
    logger?.warn("Update connection requested without a user ID");
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  const { name, userName, passowrd } = body;
  try {
    let hashedPassword;
    if (passowrd) {
      hashedPassword = await HashPassword(passowrd);
    }
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(userName && { userName }),
        ...(passowrd && { password: hashedPassword }),
      },
    });

    logger.info({ userId }, "User has been deleted successfully");

    await prisma.log.create({
      data: {
        type: "USER_UPDATED",
        severity: "INFO",
        message: `User ${session.userName} has updated user: ${user.userName}.`,
        userId: session.id,
      },
    });
  } catch (err: any) {
    if (err.code === "P2002") {
      logger?.warn(
        { userId },
        "The username is duiplicated cannot create the user",
      );

      return NextResponse.json(
        { error: "The username is already taken" },
        { status: 400 },
      );
    }
    throw err;
  }
}
