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
        include: { products: true },
      });

      if (!stock) {
        throw new Error("Stock record not found.");
      }

      await tx.transaction.deleteMany({
        where: { stockId: id },
      });

      // 3. Delete the stock item (Properly awaited)
      const deletedStock = await tx.stock.delete({
        where: { id },
      });

      // 4. Create Audit Log (Properly awaited)
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
    logger?.error({ err, id }, "Failed to delete stock");
    throw err;
  }
}
