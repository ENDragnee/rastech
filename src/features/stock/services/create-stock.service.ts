import { prisma } from "@/lib/prisma";
import { CreateStockInput } from "../schemas/stock.schema";
import { ISession } from "@/types/next-auth";
import { Logger } from "pino";
import { GenerateCode } from "@/lib/generate-code";

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
    const newStock = await tx.stock.create({
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

    await tx.log.create({
      data: {
        type: "CREATED_STOCK",
        severity: "INFO",
        message: `User: ${userName} created stock ${newStock.id}`,
        userId,
      },
    });


    const invoiceNumber = GenerateCode();
    await tx.transaction.create({
      data: {
        invoiceNumber,
        type: "PURCHASED",
        quantity: newStock.quantity,
        price: newStock.costPrice,
        stockId: newStock.id,
        userId,
      },
    });
    return newStock;
  });
  logger.info({ stockId: stock.id }, "Stock created successfully");
}
