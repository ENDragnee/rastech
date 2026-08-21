import { prisma } from "@/lib/prisma";
import { CreateSaleInput } from "../schemas/sale.schema";
import { ISession } from "@/types/next-auth";
import { Logger } from "pino";
import { GenerateCode } from "@/lib/generate-code";

export async function ProcessSaleCheckout(
  body: CreateSaleInput,
  session: ISession,
  logger: Logger,
) {
  const { id: userId, userName } = session;
  const { items, paymentMethod, customerName, customerPhone } = body;

  const baseInvoiceNumber = GenerateCode();
  const safeCustomerName = customerName?.trim() || null;
  const safeCustomerPhone = customerPhone?.trim() || null;

  const result = await prisma.$transaction(async (tx) => {
    const createdTransactions = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // 1. Fetch Stock and product details
      const stock = await tx.stock.findUnique({
        where: { id: item.stockId },
        include: { products: true },
      });

      if (!stock) {
        throw new Error(`Stock record with ID "${item.stockId}" not found.`);
      }

      if (stock.quantity < item.quantity) {
        throw new Error(
          `Insufficient stock for "${stock.products.name}". Available: ${stock.quantity}, Requested: ${item.quantity}`,
        );
      }

      // 2. Decrement stock atomically
      await tx.stock.update({
        where: { id: item.stockId },
        data: {
          quantity: { decrement: item.quantity },
        },
      });

      // 3. Compute warranty expiration
      let warrantyEndsAt: Date | null = null;
      if (stock.products.warrantyDays && stock.products.warrantyDays > 0) {
        warrantyEndsAt = new Date(
          Date.now() + stock.products.warrantyDays * 24 * 60 * 60 * 1000,
        );
      }

      const invoiceNumber =
        items.length > 1 ? `${baseInvoiceNumber}-${i + 1}` : baseInvoiceNumber;

      // 4. Create individual transaction record
      const transaction = await tx.transaction.create({
        data: {
          invoiceNumber,
          type: "SOLD",
          quantity: item.quantity,
          price: item.price,
          paymentMethod,
          customerName: safeCustomerName,
          customerPhone: safeCustomerPhone,
          warrantyEndsAt,
          stockId: item.stockId,
          userId,
        },
        include: {
          stocks: {
            include: { products: true },
          },
        },
      });

      createdTransactions.push(transaction);
    }

    // 5. Log audit event
    await tx.log.create({
      data: {
        type: "TRANSACTION_SOLD",
        severity: "INFO",
        message: `User @${userName} completed sale ${baseInvoiceNumber} with ${items.length} items (${safeCustomerName ? `Customer: ${safeCustomerName}` : "Walk-in"}).`,
        userId,
        details: {
          invoiceNumber: baseInvoiceNumber,
          paymentMethod,
          customerName: safeCustomerName,
          customerPhone: safeCustomerPhone,
          itemCount: items.length,
        },
      },
    });

    return {
      invoiceNumber: baseInvoiceNumber,
      transactions: createdTransactions,
    };
  });

  logger.info(
    { invoice: result.invoiceNumber },
    "Sale checkout completed successfully",
  );
  return result;
}
