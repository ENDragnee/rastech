import { prisma } from "@/lib/prisma";
import { ISession } from "@/types/next-auth";
import { Logger } from "pino";

export async function DeleteBank(
  id: string,
  session?: ISession,
  logger?: Logger,
) {
  if (!id) {
    throw new Error("Bank ID is required for deletion");
  }

  const result = await prisma.$transaction(async (tx) => {
    const bank = await tx.bank.findUnique({
      where: { id },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    });

    if (!bank) {
      throw new Error("Bank account record not found.");
    }

    // 1. Explicitly decouple past transactions by setting bankId to null
    await tx.transaction.updateMany({
      where: { bankId: id },
      data: { bankId: null },
    });

    // 2. Delete the bank record
    const deletedBank = await tx.bank.delete({
      where: { id },
    });

    // 3. Create Audit Log
    if (session?.id) {
      await tx.log.create({
        data: {
          type: "DELETE_BANK",
          severity: "WARNING",
          message: `User @${session.userName} deleted bank "${bank.name}" (${bank._count.transactions} transactions decoupled).`,
          userId: session.id,
          targetId: id,
          targetName: bank.name,
        },
      });
    }

    return {
      ...deletedBank,
      accountNumber: deletedBank.accountNumber
        ? deletedBank.accountNumber.toString()
        : null,
    };
  });

  logger?.info(
    { bankId: id },
    "Bank deleted and transactions detached successfully",
  );
  return result;
}
