import { prisma } from "@/lib/prisma";
import { CreateCategoryInput } from "../schemas/category.schema";
import { ISession } from "@/types/next-auth";
import { Logger } from "pino";
import { NextResponse } from "next/server";

export async function CreateCategory(
  body: CreateCategoryInput,
  session: ISession,
  logger: Logger,
) {
  const { name, description } = body;
  const { id: userId, userName } = session;

  try {
    const category = await prisma.category.create({
      data: {
        name,
        ...(description && { description }),
      },
    });

    logger.info({ userName }, "Category created successfully");
    await prisma.log.create({
      data: {
        type: "CATEGORY_CREATE",
        severity: "INFO",
        message: `User ${userName} has created category ${category.name}`,
        userId,
      },
    });
  } catch (err: any) {
    if (err.code === "P2002") {
      logger.warn({ userId }, "Duplicate category name request blocked");

      return NextResponse.json(
        { error: "The category name is used" },
        { status: 400 },
      );
    }
    throw err;
  }
}
