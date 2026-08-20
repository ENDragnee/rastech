import { prisma } from "@/lib/prisma";
import { CreateTransactionInput } from "../schemas/transaction.schema";
import { ISession } from "@/types/next-auth";
import { Logger } from "pino";
import { GenerateCode } from "@/lib/generate-code";

export async function CreateTransaction(
  body: CreateTransactionInput,
  session: ISession,
  logger: Logger,
) {
  const { id: userId, userName } = session;
  const { type, quantity, price, stockId } = body;

  const result = await prisma.$transaction(async (tx) => {
    // 1. Fetch the stock to check if it exists
    const stock = await tx.stock.findUnique({
      where: { id: stockId },
    });

    if (!stock) {
      throw new Error("Stock not found");
    }

    // 2. Validate quantity
    if (
      (type === "SOLD" || type === "DEFECTIVE" || type === "ADJUSTMENT_LOSS") &&
      stock.quantity < quantity
    ) {
      throw new Error("Insufficient stock quantity");
    }

    // 3. Determine quantity adjustment
    let quantityChange = 0;
    if (type === "PURCHASED" || type === "RETURNED") {
      quantityChange = quantity;
    } else if (
      type === "SOLD" ||
      type === "DEFECTIVE" ||
      type === "ADJUSTMENT_LOSS"
    ) {
      quantityChange = -quantity;
    }

    // 4. Update stock quantity
    const updatedStock = await tx.stock.update({
      where: { id: stockId },
      data: {
        quantity: {
          increment: quantityChange,
        },
      },
    });

    // 5. Create transaction record
    const invoiceNumber = GenerateCode();
    const transaction = await tx.transaction.create({
      data: {
        invoiceNumber,
        type,
        quantity,
        price,
        stockId,
        userId,
      },
    });

    // 6. Log the action
    await tx.log.create({
      data: {
        type: "CREATED_TRANSACTION",
        severity: "INFO",
        message: `User: ${userName} created a transaction ${type} for stock ${stock.id} with quantity ${quantity}`,
        userId,
      },
    });

    return transaction;
  });

  logger.info({ transactionId: result.id }, "Transaction created successfully");
  return result;
}
