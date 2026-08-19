import { prisma } from "@/lib/prisma";
import { UpdateCategoryInput } from "../schemas/category.schema";
import { ISession } from "@/types/next-auth";
import { DynamicApiRouteInput } from "@/lib/schemas/dynmaic-route.schema";
import { Logger } from "pino";
import { NextResponse } from "next/server";

export async function UpdateCategory(
  body: UpdateCategoryInput,
  session: ISession,
  params: DynamicApiRouteInput | undefined,
  logger: Logger,
) {
  const id = params?.id;
  if (!id) {
    logger?.warn("Update category requested without a category ID");
    return NextResponse.json(
      { error: "Category ID required" },
      { status: 400 },
    );
  }

  const { name, description } = body;
  const { id: userId, userName } = session;

  try {
    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
      },
    });

    logger.info({ id }, "Category updated successfully");

    await prisma.log.create({
      data: {
        type: "CATEGORY_UPDATED",
        severity: "INFO",
        message: `User ${userName} has updated category ${id}`,
        userId,
      },
    });

    return category;
  } catch (err: any) {
    throw err;
  }
}
