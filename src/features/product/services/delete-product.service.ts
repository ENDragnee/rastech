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
      // 1. Fetch Product with all stocks, credits, and history
      const product = await tx.product.findUnique({
        where: { id },
        include: {
          stocks: {
            include: {
              credit: true,
              history: true,
            },
          },
        },
      });

      if (!product) {
        throw new Error("Product record not found.");
      }

      // 2. Guard: Check for active uncollected customer debt
      const activeCredits = product.stocks
        .flatMap((s) => s.credit)
        .filter((c) => c.status === "PENDING");

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

      // 3. Guard: Check for active non-voided transactions
      const allTransactions = product.stocks.flatMap((s) => s.history);
      const activeTransactions = allTransactions.filter(
        (t) => t.type !== "VOIDED",
      );

      if (activeTransactions.length > 0) {
        throw new Error(
          `Cannot delete "${product.name}": It has ${activeTransactions.length} active recorded transaction(s). You must void all transactions on this product first.`,
        );
      }

      // 4. Extract stock IDs for cleanup
      const stockIds = product.stocks.map((s) => s.id);
      const voidedTxCount = allTransactions.length;

      if (stockIds.length > 0) {
        // Purge attached resolved credits
        await tx.credit.deleteMany({
          where: { stockId: { in: stockIds } },
        });

        // Purge voided transactions
        await tx.transaction.deleteMany({
          where: { stockId: { in: stockIds } },
        });

        // Delete stock records
        await tx.stock.deleteMany({
          where: { productId: id },
        });
      }

      // 5. Delete product
      const deletedProduct = await tx.product.delete({
        where: { id },
      });

      // 6. Audit Log
      await tx.log.create({
        data: {
          type: "DELETE_PRODUCT",
          severity: "WARNING",
          message: `User @${userName} deleted product "${product.name}" (${id}). Purged ${voidedTxCount} voided transaction(s) and ${stockIds.length} stock batch(es).`,
          userId,
          targetId: id,
          targetName: product.name,
          details: {
            sku: product.sku,
            stocksPurged: stockIds.length,
            voidedTransactionsPurged: voidedTxCount,
          },
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
