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
  logger?: Logger,
) {
  const { id: userId, userName } = session;

  const id = params?.id;
  if (!id) {
    logger?.warn("Update requested without a product ID");
    return NextResponse.json({ error: "Product ID required" }, { status: 400 });
  }

  const { name, description, categoryId, sku, warrantyDays, withVat } = body;

  try {
    const updatedProduct = await prisma.$transaction(async (tx) => {
      // 1. Verify category exists if changed
      if (categoryId) {
        const categoryExists = await tx.category.findUnique({
          where: { id: categoryId },
          select: { id: true },
        });

        if (!categoryExists) {
          throw { code: "P2003" };
        }
      }

      // 2. Update Product attributes (including withVat)
      const product = await tx.product.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(categoryId && { categoryId }),
          ...(sku && { sku }),
          ...(warrantyDays !== undefined && { warrantyDays }),
          ...(withVat !== undefined && { withVat }), // <-- Updates withVat in DB
        },
      });

      // 3. Synchronize any existing stock batches to match
      if (withVat !== undefined) {
        await tx.stock.updateMany({
          where: { productId: id },
          data: { withVat },
        });
      }

      // 4. Create Audit Log
      await tx.log.create({
        data: {
          type: "UPDATE_PRODUCT",
          severity: "INFO",
          message: `User @${userName} updated product "${product.name}" (${id})`,
          userId: userId,
          targetId: product.id,
          targetName: product.name,
        },
      });

      return product;
    });

    logger?.info({ id }, "Updated product successfully");
    return updatedProduct;
  } catch (err: any) {
    if (err.code === "P2002") {
      logger?.warn({ userId }, "Duplicate SKU error");
      return NextResponse.json(
        { error: "The SKU is already taken. Please choose another." },
        { status: 400 },
      );
    }

    if (err.code === "P2003") {
      logger?.warn({ userId, categoryId }, "Category ID does not exist in DB");
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
