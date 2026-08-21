import { prisma } from "@/lib/prisma";
import { CreateProductInput } from "../schemas/product.schema";
import { ISession } from "@/types/next-auth";
import { Logger } from "pino";
import { NextResponse } from "next/server";

export async function CreateProduct(
  body: CreateProductInput,
  session: ISession,
  logger?: Logger,
) {
  const { id: userId, userName } = session;
  const { name, description, categoryId, sku, warrantyDays, withVat } = body;

  try {
    const product = await prisma.$transaction(async (tx) => {
      // 1. Verify Category exists
      const categoryExists = await tx.category.findUnique({
        where: { id: categoryId },
        select: { id: true },
      });

      if (!categoryExists) {
        throw { code: "P2003" };
      }

      // 2. Create the Product with warrantyDays AND withVat
      const newProduct = await tx.product.create({
        data: {
          name,
          ...(description && { description }),
          categoryId,
          sku,
          warrantyDays: warrantyDays ?? 0,
          withVat: withVat ?? true, // <-- Persists withVat directly to Product table
        },
      });

      // 3. Create Audit Log
      await tx.log.create({
        data: {
          type: "CREATE_PRODUCT",
          severity: "INFO",
          message: `User @${userName} created product "${newProduct.name}" (SKU: ${newProduct.sku}, Warranty: ${newProduct.warrantyDays}d, VAT: ${newProduct.withVat ? "Yes" : "No"})`,
          userId,
          targetId: newProduct.id,
          targetName: newProduct.name,
        },
      });

      return newProduct;
    });

    logger?.info({ productId: product.id }, "Product created successfully");
    return product;
  } catch (err: any) {
    if (err.code === "P2002") {
      logger?.warn({ userId, sku }, "Duplicate SKU error");
      return NextResponse.json(
        { error: "The SKU is already taken. Please choose another." },
        { status: 400 },
      );
    }

    if (err.code === "P2003") {
      logger?.warn({ userId, categoryId }, "Category does not exist");
      return NextResponse.json(
        {
          error:
            "The selected category does not exist. Please re-select a category.",
        },
        { status: 400 },
      );
    }

    throw err;
  }
}
