import { prisma } from "@/lib/prisma";
import { CreateBankInput } from "../schemas/bank.schema";
import { ISession } from "@/types/next-auth";
import { Logger } from "pino";

export async function CreateBank(
  body: CreateBankInput,
  session: ISession,
  logger: Logger,
) {
  const bank = await prisma.bank.create({
    data: {
      name: body.name,
      accountNumber: body.accountNumber ? BigInt(body.accountNumber) : null,
    },
  });

  logger.info({ bankId: bank.id }, "Bank created");

  return {
    ...bank,
    accountNumber: bank.accountNumber ? bank.accountNumber.toString() : null,
  };
}
