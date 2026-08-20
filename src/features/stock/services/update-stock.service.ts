import { prisma } from "@/lib/prisma";
import { UpdateStockInput } from "../schemas/stock.schema";
import { DynamicApiRouteInput } from "@/lib/schemas/dynmaic-route.schema";
import { ISession } from "@/types/next-auth";
import { Logger } from "pino";
import { NextResponse } from "next/server";

export async function UpdateStock(
  body: UpdateStockInput,
  session: ISession,
  params: DynamicApiRouteInput | undefined,
  logger: Logger,
) {
  const id = params?.id;
  if (!id) {
    logger?.warn("Update stock requested without a stock ID");
    return NextResponse.json({ error: "Stock ID required" }, { status: 400 });
  }
  const {
    sellingPrice,
    costPrice,
    serialNumber,
    batchNumber,
    quantity,
    withVat,
  } = body;

  const { id: userId, userName } = session;
  const updatedStock = await prisma.$transaction(async (tx) => {
    await tx.log.create({
      data: {
        type: "UPDATED_STOCK",
        severity: "INFO",
        message: `User: ${userName} updated stock ${id}`,
        userId,
      },
    });

    return await tx.stock.update({
      where: { id },
      data: {
        ...(sellingPrice != null && { sellingPrice }),
        ...(costPrice != null && { costPrice }),
        ...(serialNumber != null && { serialNumber }),
        ...(batchNumber != null && { batchNumber }),
        ...(quantity != null && { quantity }),
        ...(withVat != null && { withVat }),
      },
    });
  });

  logger.info({ id }, "Updated stock sucessfully");

  return updatedStock;
}
