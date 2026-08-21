import { prisma } from "@/lib/prisma";
import { UpdateUserInput } from "../schemas/user.schema";
import { DynamicApiRouteInput } from "@/lib/schemas/dynmaic-route.schema";
import { HashPassword } from "@/lib/password-utils";
import { ISession } from "@/types/next-auth";
import { Logger } from "pino";
import { NextResponse } from "next/server";

export async function UpdateUser(
  body: UpdateUserInput,
  session: ISession,
  params: DynamicApiRouteInput | undefined,
  logger?: Logger,
) {
  const { id: adminId, userName: adminUsername } = session;
  const id = params?.id;

  if (!id) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  const { name, userName, passowrd, roleIds, isActive } = body;

  try {
    const updatedUser = await prisma.$transaction(async (tx) => {
      let hashedPassword: string | undefined;
      if (passowrd && passowrd.trim().length >= 3) {
        hashedPassword = await HashPassword(passowrd.trim());
      }

      let roleUpdate = undefined;
      let permissionUpdate = undefined;

      if (roleIds !== undefined) {
        const rolesWithPerms = await tx.role.findMany({
          where: { id: { in: roleIds } },
          include: { permissions: true },
        });

        const uniquePermIds = Array.from(
          new Set(
            rolesWithPerms.flatMap((r) => r.permissions.map((p) => p.id)),
          ),
        ).map((pId) => ({ id: pId }));

        roleUpdate = { set: roleIds.map((rId) => ({ id: rId })) };
        permissionUpdate = { set: uniquePermIds };
      }

      const user = await tx.user.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(userName !== undefined && { userName }),
          ...(hashedPassword && { password: hashedPassword }),
          ...(isActive !== undefined && { isActive }),
          ...(roleUpdate && { roles: roleUpdate }),
          ...(permissionUpdate && { permissions: permissionUpdate }),
        },
        include: {
          roles: { select: { id: true, name: true } },
          permissions: { select: { id: true, name: true } },
        },
      });

      await tx.log.create({
        data: {
          type: "USER_ROLES_UPDATED",
          severity: "INFO",
          message: `Admin @${adminUsername} updated roles & access for @${user.userName} (Roles: [${user.roles.map((r) => r.name).join(", ")}])`,
          userId: adminId,
          targetId: user.id,
          targetName: user.name || user.userName,
        },
      });

      return user;
    });

    logger?.info({ id }, "User roles updated successfully");
    return updatedUser;
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "Username is already taken." },
        { status: 400 },
      );
    }
    throw err;
  }
}
