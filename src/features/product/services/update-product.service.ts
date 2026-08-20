import { prisma } from "@/lib/prisma";
import { UpdateProductInput } from "../schemas/product.schema";
import { DynamicApiRouteInput } from "@/lib/schemas/dynmaic-route.schema";
import { ISession } from "@/types/next-auth";
import { Logger } from "pino";
import { NextResponse } from "next/server";

export async function UpdateProduct(
  body: UpdateProductInput,
  session: ISession,
  params: DynamicApiRouteInput | undefined,
  logger: Logger,
) {
  const { id: userId, userName } = session;

  const id = params?.id;
  if (!id) {
    logger?.warn("Update connection requested without a product ID");
    return NextResponse.json({ error: "Product ID required" }, { status: 400 });
  }
  const { name, description, categoryId, sku } = body;

  try {
    const updatedProduct = await prisma.$transaction(async (tx) => {
      await prisma.log.create({
        data: {
          type: "UPDATE_PRODUCT",
          severity: "INFO",
          message: `User ${userName} updated the product ${updatedProduct.id}`,
          userId: userId,
        },
      });
      return tx.product.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description && { description }),
          ...(categoryId && { categoryId }),
          ...(sku && { sku }),
        },
      });
    });

    logger.info({ id }, "Updated product sucessfully");

    return updatedProduct;
  } catch (err: any) {
    if (err.code === "P2002") {
      logger?.warn(
        { userId },
        "The sku is duiplicated cannot create the product",
      );

      return NextResponse.json(
        { error: "The sku is already taken" },
        { status: 400 },
      );
    }

    if (err.code === "P2003") {
      logger?.warn({ userId }, "The category doesn't exist");

      return NextResponse.json(
        { error: "The category is invalid choose a vaild category" },
        { status: 400 },
      );
    }
    throw err;
  }
}
