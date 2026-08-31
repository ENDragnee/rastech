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
          credit: true,
          history: true,
        },
      });

      if (!stock) {
        throw new Error("Stock record not found.");
      }

      // 1. Guard: Check for active uncollected debt
      const activeCredits = stock.credit.filter((c) => c.status === "PENDING");
      if (activeCredits.length > 0) {
        const totalPendingDebt = activeCredits.reduce(
          (acc, c) => acc + c.totalAmount,
          0,
        );
        throw new Error(
          `Cannot delete stock. Active customer credit of ETB ${totalPendingDebt.toFixed(
            2,
          )} is attached to this item. Settle or return the debt first.`,
        );
      }

      // 2. Guard: Check for active non-voided transactions
      const activeTransactions = stock.history.filter(
        (t) => t.type !== "VOIDED",
      );
      if (activeTransactions.length > 0) {
        throw new Error(
          `Cannot delete stock batch: It has ${activeTransactions.length} active recorded sales/transaction(s). You must void all transactions first if this was an erroneous entry.`,
        );
      }

      // 3. Purge attached resolved credits and voided transactions
      const voidedTxCount = stock.history.length;
      if (stock.credit.length > 0) {
        await tx.credit.deleteMany({
          where: { stockId: id },
        });
      }

      if (voidedTxCount > 0) {
        await tx.transaction.deleteMany({
          where: { stockId: id },
        });
      }

      // 4. Delete the stock batch
      const deletedStock = await tx.stock.delete({
        where: { id },
      });

      // 5. Audit Log
      await tx.log.create({
        data: {
          type: "DELETE_STOCK",
          severity: "WARNING",
          message: `User @${userName} deleted stock batch ${id} (${stock.products.name}). Purged ${voidedTxCount} voided transaction(s).`,
          userId,
          targetId: id,
          targetName: stock.products.name,
          details: {
            serialNumber: stock.serialNumber,
            batchNumber: stock.batchNumber,
            voidedTransactionsPurged: voidedTxCount,
          },
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
