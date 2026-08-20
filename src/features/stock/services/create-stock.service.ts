import { prisma } from "@/lib/prisma";
import { CreateStockInput } from "../schemas/stock.schema";
import { ISession } from "@/types/next-auth";
import { Logger } from "pino";

export async function CreateStock(
  body: CreateStockInput,
  session: ISession,
  logger: Logger,
) {
  const { id: userId, userName } = session;
  const {
    sellingPrice,
    costPrice,
    productId,
    serialNumber,
    batchNumber,
    quantity,
    withVat,
  } = body;

  const stock = await prisma.$transaction(async (tx) => {
    await prisma.log.create({
      data: {
        type: "CREATED_STOCK",
        severity: "INFO",
        message: `User: ${userName} created stock ${stock.id}`,
        userId,
      },
    });
    return await tx.stock.create({
      data: {
        costPrice,
        sellingPrice,
        quantity,
        withVat,
        productId,
        ...(serialNumber && { serialNumber }),
        ...(batchNumber && { batchNumber }),
      },
    });
  });
  logger.info({ stockId: stock.id }, "Stock created successfully");
}
