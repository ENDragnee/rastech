import { prisma } from "@/lib/prisma";

export async function FetchCategories() {
  try {
    const categories = await prisma.category.findMany();

    return categories;
  } catch (err) {
    throw err;
  }
}
