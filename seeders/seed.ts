import "dotenv/config";
import { HashPassword } from "../src/lib/password-utils";
import { modulesData } from "./data/01-modules";
import { permissionsData } from "./data/02-permissions";
import { rolesData } from "./data/03-roles";
import { usersData } from "./data/04-users";
import { categoriesData } from "./data/05-categories";
import { productsData } from "./data/06-products";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("\x1b[36m%s\x1b[0m", "🌱 Starting Rastech Database Seeder...");

  // 1. Clean existing records in reverse dependency order
  console.log("🧹 Clearing old data...");
  await prisma.transaction.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
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

  // 5. Seed Users & Assign Roles + Direct Permissions
  console.log("👤 Seeding staff users...");
  const createdUsers = new Map<string, string>();
  for (const u of usersData) {
    // Hash password with your helper or fallback
    const password = await HashPassword(u.passwordRaw);

    const roleId = createdRoles.get(u.roleName);
    const roleDef = rolesData.find((r) => r.name === u.roleName);
    const userPermissions = (roleDef?.permissions || [])
      .map((pName) => createdPermissions.get(pName))
      .filter(Boolean)
      .map((id) => ({ id: id as string }));

    const created = await prisma.user.create({
      data: {
        name: u.name,
        userName: u.userName,
        password,
        isActive: true,
        roles: roleId ? { connect: [{ id: roleId }] } : undefined,
        permissions: { connect: userPermissions },
      },
    });
    createdUsers.set(u.userName, created.id);
  }

  // 6. Seed Categories
  console.log("🏷️  Seeding product categories...");
  const createdCategories = new Map<string, string>();
  for (const cat of categoriesData) {
    const created = await prisma.category.create({
      data: {
        name: cat.name,
        description: cat.description,
      },
    });
    createdCategories.set(cat.name, created.id);
  }

  // 7. Seed Products & Stocks
  console.log("💻 Seeding products, serialized hardware & batch stocks...");
  const createdStockIds: string[] = [];

  for (const prod of productsData) {
    const categoryId = createdCategories.get(prod.categoryName);
    if (!categoryId) continue;

    const createdProduct = await prisma.product.create({
      data: {
        name: prod.name,
        sku: prod.sku,
        description: prod.description,
        warrantyDays: prod.warrantyDays,
        categoryId,
      },
    });

    for (const st of prod.stocks) {
      const createdStock = await prisma.stock.create({
        data: {
          serialNumber: st.serialNumber || null,
          batchNumber: st.batchNumber || null,
          quantity: st.quantity,
          costPrice: st.costPrice,
          sellingPrice: st.sellingPrice,
          withVat: st.withVat,
          productId: createdProduct.id,
        },
      });
      createdStockIds.push(createdStock.id);
    }
  }

  // 8. Seed Sample Transactions (for testing Cashier / POS history & Returns)
  console.log("🧾 Seeding initial sample transactions...");
  const cashierId = createdUsers.get("cashier");

  if (cashierId && createdStockIds.length > 0) {
    // 1. Completed sale with Serial Number
    await prisma.transaction.create({
      data: {
        invoiceNumber: "INV-2026-0001",
        type: "SOLD",
        quantity: 1,
        price: 1999.0,
        paymentMethod: "CARD",
        customerName: "Abebe Kebede",
        customerPhone: "+251911223344",
        warrantyEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        stockId: createdStockIds[0],
        userId: cashierId,
      },
    });

    // 2. Completed sale with Accessories (Cash)
    if (createdStockIds.length > 3) {
      await prisma.transaction.create({
        data: {
          invoiceNumber: "INV-2026-0002",
          type: "SOLD",
          quantity: 2,
          price: 199.98,
          paymentMethod: "CASH",
          customerName: "Sara Tesfaye",
          customerPhone: "+251922334455",
          warrantyEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          stockId: createdStockIds[createdStockIds.length - 2],
          userId: cashierId,
        },
      });
    }

    // 3. Returned item example for testing returns flow
    if (createdStockIds.length > 2) {
      await prisma.transaction.create({
        data: {
          invoiceNumber: "INV-2026-0003-RET",
          type: "RETURNED",
          quantity: 1,
          price: 65.0,
          paymentMethod: "CASH",
          customerName: "Dawit Alemu",
          customerPhone: "+251933445566",
          stockId: createdStockIds[2],
          userId: cashierId,
        },
      });
    }
  }

  // 9. Seed Initial Audit Logs
  console.log("📜 Seeding audit logs...");
  const adminId = createdUsers.get("admin");
  if (adminId) {
    await prisma.log.createMany({
      data: [
        {
          type: "SYSTEM_INITIALIZED",
          severity: "INFO",
          message:
            "Rastech Inventory Database initialized and seeded successfully.",
          userId: adminId,
        },
        {
          type: "STOCK_EDITED",
          severity: "INFO",
          message: "Initial stock intake for 2026 Q1 added to warehouse.",
          userId: adminId,
        },
      ],
    });
  }

  console.log("\n\x1b[32m%s\x1b[0m", "✨ Database seeded successfully!");
  console.log("\n────────────────────────────────────────────");
  console.log("🔑 Default Test Accounts:");
  console.log("  • ADMIN   : username: admin    | password: Admin123!");
  console.log("  • MANAGER : username: manager  | password: Manager123!");
  console.log("  • CASHIER : username: cashier  | password: Cashier123!");
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
