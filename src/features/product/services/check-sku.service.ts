import { prisma } from "@/lib/prisma";
import { FetchProductsInput } from "../schemas/product.schema";
import { NextResponse } from "next/server";

export async function CheckSku(req: Pick<FetchProductsInput, "search">) {
  const { search: sku } = req;

  try {
    const existingProduct = await prisma.product.findUnique({
      where: { sku },
      select: { id: true },
    });

    if (existingProduct) {
      return NextResponse.json(
        { available: false, message: "SKU is already in use" },
        { status: 200 },
      );
    }
    return NextResponse.json(
      { available: true, message: "SKU is available" },
      { status: 200 },
    );
  } catch (err) {
    throw err;
  }
}
