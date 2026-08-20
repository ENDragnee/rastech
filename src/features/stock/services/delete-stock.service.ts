import { prisma } from "@/lib/prisma";
import { DynamicApiRouteInput } from "@/lib/schemas/dynmaic-route.schema";
import { ISession } from "@/types/next-auth";
import { Logger } from "pino";
import { NextResponse } from "next/server";

export async function DeleteStock(
  session: ISession,
  params: DynamicApiRouteInput | undefined,
  logger: Logger,
) {
  const { id: userId, userName } = session;
  const id = params?.id;

  if (!id) {
    logger?.warn("Delete stock requested without a stock ID");
    return NextResponse.json({ error: "Stock ID required" }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    tx.stock.delete({ where: { id } });
    tx.log.create({
      data: {
        type: "DELTE_STOCK",
        severity: "INFO",
        message: `User: ${userName} deleted stock ${id}`,
        userId,
      },
    });
  });
}
