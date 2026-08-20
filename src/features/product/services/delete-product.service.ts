import { prisma } from "@/lib/prisma";
import { DynamicApiRouteInput } from "@/lib/schemas/dynmaic-route.schema";
import { ISession } from "@/types/next-auth";
import { Logger } from "pino";
import { NextResponse } from "next/server";

export async function DeleteProduct(
  session: ISession,
  params: DynamicApiRouteInput | undefined,
  logger: Logger,
) {
  const id = params?.id;
  if (!id) {
    logger?.warn("Update connection requested without a product ID");
    return NextResponse.json({ error: "Product ID required" }, { status: 400 });
  }
  const { id: userId, userName } = session;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.product.delete({ where: { id } });
      await tx.log.create({
        data: {
          type: "DELETE_PRODUCT",
          severity: "INFO",
          message: `User ${userName} deleted product ${id}`,
          userId,
        },
      });
    });

    logger.info({ userId }, "Product deleted successfully");
  } catch (err) {
    throw err;
  }
}
