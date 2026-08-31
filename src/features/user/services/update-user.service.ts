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
    logger?.warn("Update user requested without target user ID");
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  const { name, userName, passowrd, roleIds, isActive } = body;

  // Security Guard: Prevent admin from deactivating their own account
  if (id === adminId && isActive === false) {
    return NextResponse.json(
      { error: "You cannot deactivate your own administrative account." },
      { status: 400 },
    );
  }

  try {
    const updatedUser = await prisma.$transaction(async (tx) => {
      // 1. Fetch current user state to compare changes
      const existingUser = await tx.user.findUnique({
        where: { id },
        include: {
          roles: true,
        },
      });

      if (!existingUser) {
        throw new Error("Target user account does not exist.");
      }

      // 2. Hash new password if provided
      let hashedPassword: string | undefined;
      const rawPassword = passowrd;
      if (rawPassword && rawPassword.trim().length >= 3) {
        hashedPassword = await HashPassword(rawPassword.trim());
      }

      // 3. Resolve role & permission associations
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

      // 4. Update the user record
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

      // 5. Security: If account is deactivated, revoke all active sessions immediately
      if (isActive === false) {
        await tx.session.deleteMany({
          where: { userId: id },
        });
      }

      // 6. Context-Aware Audit Logging
      let logType = "USER_UPDATED";
      let logMessage = `Admin @${adminUsername} updated account details for @${user.userName}`;

      if (isActive === true && existingUser.isActive === false) {
        logType = "USER_REACTIVATED";
        logMessage = `Admin @${adminUsername} reactivated user account @${user.userName}`;
      } else if (isActive === false && existingUser.isActive === true) {
        logType = "USER_DEACTIVATED";
        logMessage = `Admin @${adminUsername} deactivated user account @${user.userName} and revoked active sessions`;
      } else if (roleIds !== undefined) {
        logType = "USER_ROLES_UPDATED";
        logMessage = `Admin @${adminUsername} updated roles for @${user.userName} (Roles: [${user.roles
          .map((r) => r.name)
          .join(", ")}])`;
      } else if (hashedPassword) {
        logType = "PASSWORD_UPDATED";
        logMessage = `Admin @${adminUsername} reset password for user @${user.userName}`;
      }

      await tx.log.create({
        data: {
          type: logType,
          severity: isActive === false ? "WARNING" : "INFO",
          message: logMessage,
          userId: adminId,
          targetId: user.id,
          targetName: user.name || user.userName,
          details: {
            updatedFields: {
              name: name !== undefined,
              userName: userName !== undefined,
              passwordReset: !!hashedPassword,
              isActive:
                isActive !== undefined ? isActive : existingUser.isActive,
              roleCount: user.roles.length,
            },
          },
        },
      });

      return user;
    });

    logger?.info({ targetUserId: id, adminId }, "User updated successfully");
    return updatedUser;
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "The username is already taken by another account." },
        { status: 400 },
      );
    }
    if (
      err.code === "P2025" ||
      err.message === "Target user account does not exist."
    ) {
      return NextResponse.json(
        { error: "User account not found." },
        { status: 404 },
      );
    }
    logger?.error({ err: err.message, id }, "Failed to update user");
    throw err;
  }
}
