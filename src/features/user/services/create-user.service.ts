import { prisma } from "@/lib/prisma";
import type { CreateUserInput } from "../schemas/user.schema";
import { ISession } from "@/types/next-auth";
import { Logger } from "pino";
import { HashPassword } from "@/lib/password-utils";
import { NextResponse } from "next/server";

export async function CreateUser(
  body: CreateUserInput,
  session: ISession,
  logger?: Logger,
) {
  const userId = session!.id;
  const { name, userName, passowrd, isActive } = body;

  try {
    const hashedPassword = await HashPassword(passowrd);

    if (!hashedPassword) {
      logger?.error({ userId }, "Failed to hash the password");
      return NextResponse.json(
        { error: "Failed to hash the password" },
        { status: 500 },
      );
    }
    const createUser = await prisma.$transaction(async (tx) => {
      await tx.log.create({
        data: {
          type: "USER_CREATE",
          severity: "INFO",
          message: `User ${session.userName} has created a user: ${createUser.userName}`,
          userId: userId,
        },
      });
      return tx.user.create({
        data: {
          ...(name ? { name } : { name: "" }),
          userName,
          password: hashedPassword,
          isActive,
        },
      });
    });

    logger?.info({ userId: createUser.id }, "User created successfully");

    return createUser;
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
