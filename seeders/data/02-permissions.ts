export interface PermissionSeed {
  name: string;
  guardName: string;
  moduleSlug: string;
}

export const permissionsData: PermissionSeed[] = [
  // Transactions
  { name: "CREATE_TRANSACTION", guardName: "web", moduleSlug: "transactions" },
  { name: "FETCH_TRANSACTION", guardName: "web", moduleSlug: "transactions" },
  { name: "VOID_TRANSACTION", guardName: "web", moduleSlug: "transactions" },
  { name: "PROCESS_SALE", guardName: "web", moduleSlug: "transactions" },
  { name: "PROCESS_RETURN", guardName: "web", moduleSlug: "transactions" },

  // Products
  { name: "FETCH_PRODUCTS", guardName: "web", moduleSlug: "products" },
  { name: "CREATE_PRODUCT", guardName: "web", moduleSlug: "products" },
  { name: "UPDATE_PRODUCT", guardName: "web", moduleSlug: "products" },
  { name: "DELETE_PRODUCT", guardName: "web", moduleSlug: "products" },

  // Stock
  { name: "FETCH_STOCK", guardName: "web", moduleSlug: "stock" },
  { name: "CREATE_STOCK", guardName: "web", moduleSlug: "stock" },
  { name: "UPDATE_STOCK", guardName: "web", moduleSlug: "stock" },
  { name: "DELETE_STOCK", guardName: "web", moduleSlug: "stock" },

  // Categories
  { name: "FETCH_CATEGORIES", guardName: "web", moduleSlug: "categories" },
  { name: "CREATE_CATEGORY", guardName: "web", moduleSlug: "categories" },
  { name: "UPDATE_CATEGORY", guardName: "web", moduleSlug: "categories" },
  { name: "DELETE_CATEGORY", guardName: "web", moduleSlug: "categories" },

  // Reports & Analytics
  { name: "FETCH_REPORTS", guardName: "web", moduleSlug: "reports" },
  { name: "VIEW_ANALYTICS", guardName: "web", moduleSlug: "analytics" },

  // Users
  { name: "FETCH_ALL_USERS", guardName: "web", moduleSlug: "users" },
  { name: "CREATE_USER", guardName: "web", moduleSlug: "users" },
  { name: "UPDATE_USER", guardName: "web", moduleSlug: "users" },
  { name: "DELETE_USER", guardName: "web", moduleSlug: "users" },

  // Roles
  { name: "FETCH_ROLE", guardName: "web", moduleSlug: "roles" },
  { name: "CREATE_ROLE", guardName: "web", moduleSlug: "roles" },
  { name: "UPDATE_ROLE", guardName: "web", moduleSlug: "roles" },
  { name: "DELETE_ROLE", guardName: "web", moduleSlug: "roles" },

  // Logs
  { name: "FETCH_LOGS", guardName: "web", moduleSlug: "logs" },

  { name: "FETCH_CREDIT", guardName: "web", moduleSlug: "credits" },
  { name: "CREATE_CREDIT", guardName: "web", moduleSlug: "credits" },
  { name: "UPDATE_CREDIT", guardName: "web", moduleSlug: "credits" },
  { name: "DELETE_CREDIT", guardName: "web", moduleSlug: "credits" },

  { name: "FETCH_BANK", guardName: "web", moduleSlug: "banks" },
  { name: "CREATE_BANK", guardName: "web", moduleSlug: "banks" },
  { name: "UPDATE_BANK", guardName: "web", moduleSlug: "banks" },
  { name: "DELETE_BANK", guardName: "web", moduleSlug: "banks" },
];
