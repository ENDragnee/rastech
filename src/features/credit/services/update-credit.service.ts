import { prisma } from "@/lib/prisma";
import { UpdateCreditInput } from "../schemas/credit.schema";
import { ISession } from "@/types/next-auth";
import { Logger } from "pino";

export async function UpdateCredit(
  creditId: string,
  body: UpdateCreditInput,
  session: ISession,
  logger: Logger,
) {
  const { id: userId, userName } = session;
  const { status, dueDate, notes } = body;

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.credit.findUnique({
      where: { id: creditId },
      include: {
        stock: { include: { products: true } },
      },
    });

    if (!existing) {
      throw new Error("Credit record not found.");
    }

    if (existing.status !== "PENDING" && existing.status !== status) {
      throw new Error(
        `Cannot modify credit already marked as ${existing.status}`,
      );
    }

    // If customer RETURNS the item instead of paying, restock it back to inventory
    if (status === "RETURNED" && existing.status === "PENDING") {
      await tx.stock.update({
        where: { id: existing.stockId },
        data: {
          quantity: { increment: existing.quantity },
        },
      });
    }

    const updatedCredit = await tx.credit.update({
      where: { id: creditId },
      data: {
        status,
        ...(dueDate !== undefined && {
          dueDate: dueDate ? new Date(dueDate) : null,
        }),
        approvedById: userId,
      },
      include: {
        stock: { include: { products: true } },
        transaction: true,
        createdBy: { select: { name: true, userName: true } },
        approvedBy: { select: { name: true, userName: true } },
      },
    });

    // Audit log
    await tx.log.create({
      data: {
        type: `CREDIT_${status}`,
        severity: status === "DEFAULTED" ? "WARNING" : "INFO",
        message: `User @${userName} resolved credit for ${existing.customerName} as ${status}. ${notes ? `Notes: ${notes}` : ""}`,
        userId,
        targetId: creditId,
        targetName: existing.stock.products.name,
      },
    });

    return updatedCredit;
  });

  logger.info({ creditId, status }, "Credit status updated");
  return result;
}
