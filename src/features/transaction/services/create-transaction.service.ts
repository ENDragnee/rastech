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
  const {
    type,
    stockId,
    quantity,
    price,
    paymentMethod,
    customerName,
    customerPhone,
    originalTransactionId,
    reason,
  } = body;

  const result = await prisma.$transaction(async (tx) => {
    // 1. Fetch stock and linked product info
    const stock = await tx.stock.findUnique({
      where: { id: stockId },
      include: {
        products: true,
      },
    });

    if (!stock) {
      throw new Error("Stock item not found.");
    }

    let warrantyEndsAt: Date | null = null;
    let invoiceNumber = GenerateCode();

    // ==========================================
    // CASE A: NEW SALE (POS CHECKOUT)
    // ==========================================
    if (type === "SOLD") {
      if (stock.quantity < quantity) {
        throw new Error(
          `Insufficient stock quantity. Available: ${stock.quantity}, Requested: ${quantity}`,
        );
      }

      // Decrement available stock
      await tx.stock.update({
        where: { id: stockId },
        data: {
          quantity: {
            decrement: quantity,
          },
        },
      });

      // Calculate hardware warranty expiration date
      if (stock.products.warrantyDays && stock.products.warrantyDays > 0) {
        const now = new Date();
        warrantyEndsAt = new Date(
          now.getTime() + stock.products.warrantyDays * 24 * 60 * 60 * 1000,
        );
      }
    }

    // ==========================================
    // CASE B: RETURN / WARRANTY CLAIM
    // ==========================================
    else if (type === "RETURNED" || type === "DEFECTIVE") {
      if (originalTransactionId) {
        const originalTx = await tx.transaction.findUnique({
          where: { id: originalTransactionId },
        });

        if (!originalTx) {
          throw new Error("Original sale invoice not found.");
        }

        if (
          originalTx.warrantyEndsAt &&
          new Date() > new Date(originalTx.warrantyEndsAt)
        ) {
          throw new Error("Product warranty has expired.");
        }

        invoiceNumber = `${originalTx.invoiceNumber || GenerateCode()}-RET`;
      }

      // If item is working (RETURNED), add back to saleable stock.
      // If item is broken (DEFECTIVE), do NOT add back to active stock.
      if (type === "RETURNED") {
        await tx.stock.update({
          where: { id: stockId },
          data: {
            quantity: {
              increment: quantity,
            },
          },
        });
      }
    }

    // ==========================================
    // CASE C: INVENTORY ADJUSTMENT / PURCHASES
    // ==========================================
    else if (type === "PURCHASED") {
      await tx.stock.update({
        where: { id: stockId },
        data: {
          quantity: {
            increment: quantity,
          },
        },
      });
    } else if (type === "ADJUSTMENT_LOSS") {
      if (stock.quantity < quantity) {
        throw new Error("Cannot adjust loss greater than existing stock.");
      }
      await tx.stock.update({
        where: { id: stockId },
        data: {
          quantity: {
            decrement: quantity,
          },
        },
      });
    }

    // 2. Create Transaction Record
    const transaction = await tx.transaction.create({
      data: {
        invoiceNumber,
        type,
        quantity,
        price,
        paymentMethod: paymentMethod || "CASH",
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        warrantyEndsAt,
        stockId,
        userId,
      },
      include: {
        stocks: {
          include: {
            products: true,
          },
        },
      },
    });

    // 3. Create Audit Trail Log
    await tx.log.create({
      data: {
        type: `TRANSACTION_${type}`,
        severity: "INFO",
        message: `User @${userName} processed ${type} for "${stock.products.name}" (Qty: ${quantity}, Total: $${price.toFixed(2)}). ${reason ? `Reason: ${reason}` : ""}`,
        userId,
        targetId: transaction.id,
        targetName: stock.products.name,
        details: {
          invoiceNumber,
          stockId,
          productId: stock.products.id,
          serialNumber: stock.serialNumber,
          batchNumber: stock.batchNumber,
          quantity,
          price,
          paymentMethod,
        },
      },
    });

    return transaction;
  });

  logger.info(
    { transactionId: result.id, invoiceNumber: result.invoiceNumber, type },
    "Transaction processed successfully",
  );

  return result;
}
