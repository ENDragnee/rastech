import "dotenv/config";
import { HashPassword } from "../src/lib/password-utils";
import { modulesData } from "./data/01-modules";
import { permissionsData } from "./data/02-permissions";
import { rolesData } from "./data/03-roles";
import { usersData } from "./data/04-users";
import { categoriesData } from "./data/05-categories";
import { banksData } from "./data/07-banks";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("\x1b[36m%s\x1b[0m", "🌱 Starting Rastech Database Seeder...");

  // 1. Clean existing records in reverse dependency order
  console.log("🧹 Clearing old data...");
  await prisma.credit.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.bank.deleteMany();
  await prisma.log.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.module.deleteMany();

  // 2. Seed Modules
  console.log("📦 Seeding modules...");
  const createdModules = new Map<string, string>();
  for (const mod of modulesData) {
    const created = await prisma.module.create({
      data: {
        name: mod.name,
        slug: mod.slug,
        isActive: mod.isActive,
      },
    });
    createdModules.set(mod.slug, created.id);
  }

  // 3. Seed Permissions
  console.log("🔑 Seeding permissions...");
  const createdPermissions = new Map<string, string>();
  for (const perm of permissionsData) {
    const moduleId = createdModules.get(perm.moduleSlug);
    if (!moduleId) continue;

    const created = await prisma.permission.create({
      data: {
        name: perm.name,
        guardName: perm.guardName,
        moduleId,
      },
    });
    createdPermissions.set(perm.name, created.id);
  }

  // 4. Seed Roles & Link Permissions
  console.log("🛡️  Seeding roles & assigning permissions...");
  const createdRoles = new Map<string, string>();
  for (const role of rolesData) {
    const permissionConnect = role.permissions
      .map((pName) => createdPermissions.get(pName))
      .filter(Boolean)
      .map((id) => ({ id: id as string }));

    const created = await prisma.role.create({
      data: {
        name: role.name,
        guardName: role.guardName,
        permissions: {
          connect: permissionConnect,
        },
      },
    });
    createdRoles.set(role.name, created.id);
  }

  // 5. Seed Users with Multiple Roles and Aggregated Permissions
  console.log("👤 Seeding multi-role staff users...");
  const createdUsers = new Map<string, string>();
  for (const u of usersData) {
    const password = await HashPassword(u.passwordRaw);

    // Map role IDs
    const roleConnect = u.roleNames
      .map((rName) => createdRoles.get(rName))
      .filter(Boolean)
      .map((id) => ({ id: id as string }));

    // Aggregate unique permissions across all assigned roles
    const allRolePermNames = new Set<string>();
    for (const rName of u.roleNames) {
      const roleDef = rolesData.find((r) => r.name === rName);
      roleDef?.permissions.forEach((p) => allRolePermNames.add(p));
    }

    const permissionConnect = Array.from(allRolePermNames)
      .map((pName) => createdPermissions.get(pName))
      .filter(Boolean)
      .map((id) => ({ id: id as string }));

    const created = await prisma.user.create({
      data: {
        name: u.name,
        userName: u.userName,
        password,
        isActive: true,
        roles: { connect: roleConnect },
        permissions: { connect: permissionConnect },
      },
    });
    createdUsers.set(u.userName, created.id);
  }

  // 6. Seed Categories
  console.log("🏷️  Seeding product categories...");
  for (const cat of categoriesData) {
    await prisma.category.create({
      data: {
        name: cat.name,
        description: cat.description,
      },
    });
  }

  // 7. Seed Commercial Banks
  console.log("🏦 Seeding commercial banks...");
  for (const b of banksData) {
    await prisma.bank.create({
      data: {
        name: b.name,
        accountNumber: b.accountNumber,
      },
    });
  }

  // 8. Seed System Logs
  const adminId = createdUsers.get("admin");
  if (adminId) {
    await prisma.log.create({
      data: {
        type: "SYSTEM_INITIALIZED",
        severity: "INFO",
        message:
          "Rastech Inventory Database initialized with multi-role support.",
        userId: adminId,
      },
    });
  }

  console.log("\n\x1b[32m%s\x1b[0m", "✨ Database seeded successfully!");
  console.log("────────────────────────────────────────────");
  console.log("🔑 Default Test Accounts:");
  console.log("  • ADMIN   : admin    | Admin123!   (Roles: ADMIN, MANAGER)");
  console.log("  • MANAGER : manager  | Manager123! (Roles: MANAGER)");
  console.log("  • CASHIER : cashier  | Cashier123! (Roles: CASHIER)");
  console.log("────────────────────────────────────────────\n");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
