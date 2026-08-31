import { prisma } from "@/lib/prisma";
import { ISession } from "@/types/next-auth";
import { Logger } from "pino";

export interface VoidTransactionInput {
  transactionId: string;
  reason: string;
}

export async function VoidTransaction(
  body: VoidTransactionInput,
  session: ISession,
  logger?: Logger,
) {
  const { id: adminId, userName: adminUsername } = session;
  const { transactionId, reason } = body;

  if (!transactionId) {
    throw new Error("Transaction ID is required.");
  }

  if (!reason || reason.trim().length < 5) {
    throw new Error(
      "A clear cancellation reason is required (minimum 5 characters).",
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Fetch the transaction
    const transaction = await tx.transaction.findUnique({
      where: { id: transactionId },
      include: {
        stocks: {
          include: { products: true },
        },
        credit: true,
      },
    });

    if (!transaction) {
      throw new Error("Transaction record not found.");
    }

    if (transaction.type === "VOIDED") {
      throw new Error("This transaction has already been voided/cancelled.");
    }

    // 2. Inventory Rollback:
    // If the original transaction removed stock (SOLD, DEFECTIVE, ADJUSTMENT_LOSS),
    // restore that stock back to active inventory.
    if (
      transaction.type === "SOLD" ||
      transaction.type === "DEFECTIVE" ||
      transaction.type === "ADJUSTMENT_LOSS"
    ) {
      await tx.stock.update({
        where: { id: transaction.stockId },
        data: {
          quantity: {
            increment: transaction.quantity,
          },
        },
      });
    } else if (
      transaction.type === "PURCHASED" ||
      transaction.type === "RETURNED"
    ) {
      // If it was stock intake or a return, deduct the wrongly added units
      if (transaction.stocks.quantity < transaction.quantity) {
        throw new Error(
          `Cannot void: Stock units have already been sold or moved (Current stock: ${transaction.stocks.quantity}).`,
        );
      }
      await tx.stock.update({
        where: { id: transaction.stockId },
        data: {
          quantity: {
            decrement: transaction.quantity,
          },
        },
      });
    }

    // 3. If tied to an active Credit, resolve the credit
    if (transaction.credit && transaction.credit.status === "PENDING") {
      await tx.credit.update({
        where: { id: transaction.credit.id },
        data: {
          status: "DEFAULTED",
          approvedById: adminId,
        },
      });
    }

    // 4. Update the Transaction status to VOIDED
    const voidedTransaction = await tx.transaction.update({
      where: { id: transactionId },
      data: {
        type: "VOIDED",
      },
      include: {
        stocks: {
          include: { products: true },
        },
      },
    });

    // 5. Create High-Priority Audit Log
    await tx.log.create({
      data: {
        type: "TRANSACTION_VOIDED",
        severity: "WARNING",
        message: `Admin @${adminUsername} VOIDED invoice ${transaction.invoiceNumber} (${transaction.stocks.products.name}). Reason: ${reason}`,
        userId: adminId,
        targetId: transaction.id,
        targetName: transaction.invoiceNumber,
        details: {
          originalType: transaction.type,
          originalPrice: transaction.price,
          quantity: transaction.quantity,
          stockId: transaction.stockId,
          serialNumber: transaction.stocks.serialNumber,
          voidReason: reason,
        },
      },
    });

    return voidedTransaction;
  });

  logger?.info({ transactionId, adminId }, "Transaction voided successfully");
  return result;
}
