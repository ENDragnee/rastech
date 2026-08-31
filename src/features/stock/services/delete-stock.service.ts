import { prisma } from "@/lib/prisma";
import { DynamicApiRouteInput } from "@/lib/schemas/dynmaic-route.schema";
import { ISession } from "@/types/next-auth";
import { Logger } from "pino";
import { NextResponse } from "next/server";

export async function DeleteStock(
  session: ISession,
  params: DynamicApiRouteInput | undefined,
  logger?: Logger,
) {
  const { id: userId, userName } = session;
  const id = params?.id;

  if (!id) {
    logger?.warn("Delete stock requested without a stock ID");
    return NextResponse.json({ error: "Stock ID required" }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const stock = await tx.stock.findUnique({
        where: { id },
        include: {
          products: true,
          credit: {
            where: { status: "PENDING" },
          },
          history: true,
        },
      });

      if (!stock) {
        throw new Error("Stock record not found.");
      }

      // 1. Block deletion if there is uncollected customer debt
      if (stock.credit.length > 0) {
        const totalPendingDebt = stock.credit.reduce(
          (acc, c) => acc + c.totalAmount,
          0,
        );
        throw new Error(
          `Cannot delete stock. There is active customer credit of ETB ${totalPendingDebt.toFixed(
            2,
          )} attached to this item. Settle or return the credit first.`,
        );
      }

      // 2. Block deletion if there is financial sales history (prevent corrupting tax/sales reports)
      if (stock.history.length > 0) {
        throw new Error(
          `Cannot delete stock batch with completed financial transactions (${stock.history.length} transactions recorded).`,
        );
      }

      // 3. Delete stock item safely (only if no transactions or debts exist)
      const deletedStock = await tx.stock.delete({
        where: { id },
      });

      // 4. Audit Log
      await tx.log.create({
        data: {
          type: "DELETE_STOCK",
          severity: "WARNING",
          message: `User @${userName} deleted stock batch ${id} (${stock.products.name})`,
          userId,
          targetId: id,
          targetName: stock.products.name,
        },
      });

      return deletedStock;
    });

    logger?.info({ id }, "Stock deleted successfully");
    return result;
  } catch (err: any) {
    logger?.error({ err: err.message, id }, "Failed to delete stock");
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
