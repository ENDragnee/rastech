import { prisma } from "@/lib/prisma";
import { ProcessReturnInput } from "../schemas/return.schema";
import { ISession } from "@/types/next-auth";
import { Logger } from "pino";

export async function ProcessReturnClaim(
  body: ProcessReturnInput,
  session: ISession,
  logger: Logger,
) {
  const { id: userId, userName } = session;
  const { originalTransactionId, type, quantity, reason } = body;

  const result = await prisma.$transaction(async (tx) => {
    // 1. Fetch original transaction
    const originalTx = await tx.transaction.findUnique({
      where: { id: originalTransactionId },
      include: {
        stocks: {
          include: { products: true },
        },
      },
    });

    if (!originalTx) {
      throw new Error("Original invoice transaction not found.");
    }

    if (originalTx.type !== "SOLD") {
      throw new Error("Only completed sales can be processed for returns.");
    }

    if (quantity > originalTx.quantity) {
      throw new Error(
        `Cannot return more items than purchased (${originalTx.quantity}).`,
      );
    }

    // 2. Warranty check
    if (
      originalTx.warrantyEndsAt &&
      new Date() > new Date(originalTx.warrantyEndsAt)
    ) {
      throw new Error("Product warranty period has expired.");
    }

    // 3. Restock ONLY if condition is RETURNED (good condition)
    if (type === "RETURNED") {
      await tx.stock.update({
        where: { id: originalTx.stockId },
        data: {
          quantity: { increment: quantity },
        },
      });
    }

    // 4. Create the return transaction
    const returnInvoice = `${originalTx.invoiceNumber || "INV"}-RET`;
    const returnTransaction = await tx.transaction.create({
      data: {
        invoiceNumber: returnInvoice,
        type,
        quantity,
        price: originalTx.price,
        paymentMethod: originalTx.paymentMethod,
        customerName: originalTx.customerName,
        customerPhone: originalTx.customerPhone,
        stockId: originalTx.stockId,
        userId,
      },
      include: {
        stocks: {
          include: { products: true },
        },
      },
    });

    // 5. Audit Log
    await tx.log.create({
      data: {
        type: `TRANSACTION_${type}`,
        severity: "INFO",
        message: `User @${userName} processed ${type} on invoice ${originalTx.invoiceNumber}. Reason: ${reason}`,
        userId,
        targetId: originalTx.id,
        targetName: originalTx.stocks.products.name,
      },
    });

    return returnTransaction;
  });

  logger.info({ returnId: result.id }, "Return processed successfully");
  return result;
}
