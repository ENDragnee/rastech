import { prisma } from "@/lib/prisma";
import { CreateProductInput } from "../schemas/product.schema";
import { ISession } from "@/types/next-auth";
import { Logger } from "pino";
import { NextResponse } from "next/server";

export async function CreateProduct(
  body: CreateProductInput,
  session: ISession,
  logger: Logger,
) {
  const { id: userId, userName } = session;
  const { name, description, categoryId, sku } = body;

  try {
    const product = await prisma.$transaction(async (tx) => {
      await tx.log.create({
        data: {
          type: "CREATE_PRODUCT",
          severity: "INFO",
          message: `User ${userName} created product ${product.id}`,
          userId,
        },
      });

      return await tx.product.create({
        data: {
          name,
          ...(description && { description }),
          categoryId,
          sku,
        },
      });
    });
    logger.info({ productId: product.id }, "Product created successfully");

    return product;
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
