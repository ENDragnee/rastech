export interface RoleSeed {
  name: string;
  guardName: string;
  permissions: string[];
}

export const rolesData: RoleSeed[] = [
  {
    name: "CASHIER",
    guardName: "web",
    permissions: [
      "CREATE_TRANSACTION",
      "FETCH_TRANSACTION",
      "FETCH_PRODUCTS",
      "FETCH_CATEGORIES",
      "FETCH_STOCK",
      "PROCESS_RETURN",
      "PROCESS_SALE",
    ],
  },
  {
    name: "MANAGER",
    guardName: "web",
    permissions: [
      "VIEW_ANALYTICS",
      "FETCH_REPORTS",
      "FETCH_PRODUCTS",
      "CREATE_PRODUCT",
      "UPDATE_PRODUCT",
      "DELETE_PRODUCT",
      "FETCH_STOCK",
      "CREATE_STOCK",
      "UPDATE_STOCK",
      "DELETE_STOCK",
      "FETCH_CATEGORIES",
      "CREATE_CATEGORY",
      "UPATE_CATEGORY",
      "DELETE_CATEGORY",
      "FETCH_TRANSACTION",
      "CREATE_TRANSACTION",
      "PROCESS_RETURN",
      "PROCESS_SALE",
    ],
  },
  {
    name: "ADMIN",
    guardName: "web",
    // ADMIN has all permissions
    permissions: [
      "CREATE_TRANSACTION",
      "FETCH_TRANSACTION",
      "FETCH_LOGS",
      "FETCH_PRODUCTS",
      "CREATE_PRODUCT",
      "UPDATE_PRODUCT",
      "DELETE_PRODUCT",
      "FETCH_REPORTS",
      "CREATE_ROLE",
      "FETCH_ROLE",
      "UPDATE_ROLE",
      "DELETE_ROLE",
      "CREATE_STOCK",
      "FETCH_STOCK",
      "UPDATE_STOCK",
      "DELETE_STOCK",
      "FETCH_ALL_USERS",
      "CREATE_USER",
      "UPDATE_USER",
      "DELETE_USER",
      "FETCH_CATEGORIES",
      "UPATE_CATEGORY",
      "DELTE_CATEGORY",
      "CREATE_CATEGORY",
      "VIEW_ANALYTICS",
    ],
  },
];
