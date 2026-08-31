import { prisma } from "@/lib/prisma";
import { DynamicApiRouteInput } from "@/lib/schemas/dynmaic-route.schema";
import { ISession } from "@/types/next-auth";
import { Logger } from "pino";
import { NextResponse } from "next/server";

export async function DeleteProduct(
  session: ISession,
  params: DynamicApiRouteInput | undefined,
  logger?: Logger,
) {
  const id = params?.id;
  if (!id) {
    logger?.warn("Delete product requested without a product ID");
    return NextResponse.json({ error: "Product ID required" }, { status: 400 });
  }

  const { id: userId, userName } = session;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch Product with attached stocks, active credits, and transactions
      const product = await tx.product.findUnique({
        where: { id },
        include: {
          stocks: {
            include: {
              credit: {
                where: { status: "PENDING" },
              },
              history: true,
            },
          },
        },
      });

      if (!product) {
        throw new Error("Product record not found.");
      }

      // 2. Guard: Check for active uncollected customer debt
      const activeCredits = product.stocks.flatMap((s) => s.credit);
      if (activeCredits.length > 0) {
        const totalPendingDebt = activeCredits.reduce(
          (acc, c) => acc + c.totalAmount,
          0,
        );
        throw new Error(
          `Cannot delete "${product.name}". There is active customer credit of ETB ${totalPendingDebt.toFixed(
            2,
          )} attached. Settle or return the debt first.`,
        );
      }

      // 3. Guard: Check for financial transaction history (preserve accounting integrity)
      const totalTransactions = product.stocks.flatMap((s) => s.history).length;
      if (totalTransactions > 0) {
        throw new Error(
          `Cannot delete "${product.name}". It has ${totalTransactions} recorded sales/transaction(s). Products with historical sales cannot be deleted to preserve accounting logs.`,
        );
      }

      // 4. Guard: Check for physical inventory in warehouse
      const remainingStock = product.stocks.reduce(
        (sum, s) => sum + s.quantity,
        0,
      );
      if (remainingStock > 0) {
        throw new Error(
          `Cannot delete "${product.name}". There are still ${remainingStock} unit(s) in warehouse inventory.`,
        );
      }

      // 5. Delete empty/unused stock batches first
      await tx.stock.deleteMany({
        where: { productId: id },
      });

      // 6. Delete product
      const deletedProduct = await tx.product.delete({
        where: { id },
      });

      // 7. Audit Log
      await tx.log.create({
        data: {
          type: "DELETE_PRODUCT",
          severity: "WARNING",
          message: `User @${userName} deleted product "${product.name}" (${id})`,
          userId,
          targetId: id,
          targetName: product.name,
        },
      });

      return deletedProduct;
    });

    logger?.info({ productId: id, userId }, "Product deleted successfully");
    return result;
  } catch (err: any) {
    logger?.error(
      { err: err.message, productId: id },
      "Failed to delete product",
    );
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
