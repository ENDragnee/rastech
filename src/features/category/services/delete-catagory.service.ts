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

  try {
    await prisma.category.delete({ where: { id } });

    logger.info({ id }, "Category deleted successfully");

    await prisma.log.create({
      data: {
        type: "CATEGORY_DELETED",
        severity: "INFO",
        message: `User ${userName} has deleted category ${id}`,
        userId,
      },
    });
  } catch (err: any) {
    if (err.code === "P2002") {
      logger?.warn(
        { id },
        "The category name is duiplicated cannot create the user",
      );

      return NextResponse.json(
        { error: "The category is already taken" },
        { status: 400 },
      );
    }
    throw err;
  }
}
