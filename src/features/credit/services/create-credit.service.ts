import { prisma } from "@/lib/prisma";
import { CreateCreditInput } from "../schemas/credit.schema";
import { ISession } from "@/types/next-auth";
import { Logger } from "pino";
import { GenerateCode } from "@/lib/generate-code";

export async function CreateCredit(
  body: CreateCreditInput,
  session: ISession,
  logger: Logger,
) {
  const { id: userId, userName } = session;
  const {
    stockId,
    quantity,
    totalAmount,
    customerName,
    customerPhone,
    customerIdDoc,
    dueDate,
  } = body;

  const safePhone = customerPhone?.trim() || null;
  const safeIdDoc = customerIdDoc?.trim() || null;

  const result = await prisma.$transaction(async (tx) => {
    // 1. Fetch stock & product
    const stock = await tx.stock.findUnique({
      where: { id: stockId },
      include: { products: true },
    });

    if (!stock) {
      throw new Error("Stock item not found.");
    }

    if (stock.quantity < quantity) {
      throw new Error(
        `Insufficient inventory. Requested: ${quantity}, Available: ${stock.quantity}`,
      );
    }

    // 2. Decrement physical inventory
    await tx.stock.update({
      where: { id: stockId },
      data: {
        quantity: { decrement: quantity },
      },
    });

    // 3. Compute warranty date if applicable
    let warrantyEndsAt: Date | null = null;
    if (stock.products.warrantyDays && stock.products.warrantyDays > 0) {
      warrantyEndsAt = new Date(
        Date.now() + stock.products.warrantyDays * 24 * 60 * 60 * 1000,
      );
    }

    // 4. Create Transaction representing item departure on credit
    const invoiceNumber = `CRD-${GenerateCode()}`;
    const transaction = await tx.transaction.create({
      data: {
        invoiceNumber,
        type: "SOLD",
        quantity,
        price: totalAmount,
        paymentMethod: "CREDIT",
        customerName,
        customerPhone: safePhone,
        warrantyEndsAt,
        stockId,
        userId,
      },
    });

    // 5. Create Credit Record
    const credit = await tx.credit.create({
      data: {
        customerName,
        customerPhone: safePhone,
        customerIdDoc: safeIdDoc,
        quantity,
        totalAmount,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: "PENDING",
        stockId,
        transactionId: transaction.id,
        createdById: userId,
      },
      include: {
        stock: {
          include: { products: true },
        },
        transaction: true,
        createdBy: {
          select: { name: true, userName: true },
        },
      },
    });

    // 6. Log audit trail
    await tx.log.create({
      data: {
        type: "CREDIT_ISSUED",
        severity: "INFO",
        message: `User @${userName} credited ${quantity}x "${stock.products.name}" to ${customerName} (ETB ${totalAmount.toFixed(2)})`,
        userId,
        targetId: credit.id,
        targetName: stock.products.name,
        details: {
          creditId: credit.id,
          invoiceNumber,
          customerName,
          customerPhone: safePhone,
          totalAmount,
          stockId,
          serialNumber: stock.serialNumber,
        },
      },
    });

    return credit;
  });

  logger.info({ creditId: result.id }, "Credit issued successfully");
  return result;
}
