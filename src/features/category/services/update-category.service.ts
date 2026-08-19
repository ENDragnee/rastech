import { prisma } from "@/lib/prisma";
import { UpdateCategoryInput } from "../schemas/category.schema";
import { ISession } from "@/types/next-auth";
import { DynamicApiRouteInput } from "@/lib/schemas/dynmaic-route.schema";
import { Logger } from "pino";

export async function UpdateCategory(
  body: UpdateCategoryInput,
  session: ISession,
  params: DynamicApiRouteInput,
  logger: Logger,
) {
  const { id } = params;
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
