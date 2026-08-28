import { prisma } from "@/lib/prisma";
import { UpdateBankInput } from "../schemas/bank.schema";

export async function UpdateBank(id: string, body: UpdateBankInput) {
  const bank = await prisma.bank.update({
    where: { id },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.accountNumber !== undefined && {
        accountNumber: body.accountNumber ? BigInt(body.accountNumber) : null,
      }),
    },
  });

  return {
    ...bank,
    accountNumber: bank.accountNumber ? bank.accountNumber.toString() : null,
  };
}
