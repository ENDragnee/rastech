export interface ModuleSeed {
  name: string;
  slug: string;
  isActive: boolean;
}

export const modulesData: ModuleSeed[] = [
  { name: "Transactions & POS", slug: "transactions", isActive: true },
  { name: "Products Management", slug: "products", isActive: true },
  { name: "Stock & Inventory", slug: "stock", isActive: true },
  { name: "Categories", slug: "categories", isActive: true },
  { name: "Reports", slug: "reports", isActive: true },
  { name: "Analytics", slug: "analytics", isActive: true },
  { name: "User Management", slug: "users", isActive: true },
  { name: "Role Management", slug: "roles", isActive: true },
  { name: "Audit Logs", slug: "logs", isActive: true },
  { name: "Credit Management", slug: "credits", isActive: true },
  { name: "Bank Management", slug: "banks", isActive: true },
];
