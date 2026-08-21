import { prisma } from "@/lib/prisma";
import { DynamicApiRouteInput } from "@/lib/schemas/dynmaic-route.schema";
import { ISession } from "@/types/next-auth";
import { Logger } from "pino";
import { NextResponse } from "next/server";

export async function DeleteCategory(
  session: ISession,
  params: DynamicApiRouteInput | undefined,
  logger: Logger,
) {
  const id = params?.id;
  if (!id) {
    logger?.warn("Delete category requested without a category ID");
    return NextResponse.json(
      { error: "Category ID required" },
      { status: 400 },
    );
  }
  const { id: userId, userName } = session;

  await prisma.$transaction(async (tx) => {
    await tx.category.delete({ where: { id } });
    await tx.log.create({
      data: {
        type: "CATEGORY_DELETED",
        severity: "INFO",
        message: `User ${userName} has deleted category ${id}`,
        userId,
      },
    });
  });

  logger.info({ id }, "Category deleted successfully");
}
