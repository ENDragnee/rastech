import { prisma } from "@/lib/prisma";

export async function DeleteBank(id: string) {
  return await prisma.bank.delete({
    where: { id },
  });
}
