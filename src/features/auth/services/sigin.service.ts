import { prisma } from "@/lib/prisma";
import { ValidatePassword } from "@/lib/password-utils";
import { logger as baseLogger } from "@/lib/logger";

export async function UserNameSignIn(
  credentials: Record<"userName" | "password", string> | undefined,
) {
  const reqLogger = baseLogger.child({
    module: "usernameSignIn",
    username: credentials?.userName,
  });

  reqLogger.debug("Attempting username sign-in");

  if (!credentials?.userName || !credentials?.password) {
    reqLogger.warn("Sign-in failed: Missing credentials");
    throw new Error("Missing credentials");
  }

  const user = await prisma.user.findUnique({
    where: { userName: credentials.userName },
    include: {
      roleUsers: {
        include: {
          roles: {
            include: {
              permissionRoles: {
                include: {
                  permissions: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user || !user.password) {
    reqLogger.warn("Sign-in failed: Invalid username or no password set");
    throw new Error("Invalid username or password!");
  }

  const isValid = await ValidatePassword(credentials.password, user.password);

  if (!isValid) {
    reqLogger.warn({ userId: user.id }, "Sign-in failed: Invalid password");

    await prisma.log.create({
      data: {
        type: "AUTH_LOGIN_FAILED" as any,
        severity: "WARNING",
        message: `Failed login attempt for user: ${credentials.userName}`,
        userId: user.id,
      },
    });

    throw new Error("Invalid username or password!");
  }

  const userRoles = user.roleUsers.map((ru) => ru.roles.guardName);
  const rolePermissions = user.roleUsers.flatMap((ru) =>
    ru.roles.permissionRoles.map((pr) => pr.permissions.guardName),
  );
  reqLogger.info({ userId: user.id }, "User signed in successfully");

  await prisma.log.create({
    data: {
      type: "AUTH_LOGIN_SUCCESS" as any,
      severity: "INFO",
      message: `User ${user.userName} logged in successfully.`,
      userId: user.id,
    },
  });

  return {
    id: user.id,
    name: user.name,
    userName: user.userName,
    role: userRoles,
    permissions: Array.from(new Set(rolePermissions)),
  };
}
