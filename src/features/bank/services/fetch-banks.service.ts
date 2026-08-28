import { prisma } from "@/lib/prisma";
import { FetchBankInput } from "../schemas/bank.schema";

export async function FetchBanks(req: FetchBankInput) {
  const { search } = req;

  const banks = await prisma.bank.findMany({
    where: {
      ...(search && {
        name: { contains: search, mode: "insensitive" },
      }),
    },
    include: {
      _count: {
        select: { transactions: true },
      },
    },
    orderBy: { name: "asc" },
  });

  // Convert BigInt to string for JSON serialization
  return banks.map((b) => ({
    ...b,
    accountNumber: b.accountNumber ? b.accountNumber.toString() : null,
  }));
}
