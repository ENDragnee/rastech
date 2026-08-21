export interface UserSeed {
  name: string;
  userName: string;
  passwordRaw: string;
  roleName: "ADMIN" | "MANAGER" | "CASHIER";
}

export const usersData: UserSeed[] = [
  {
    name: "System Administrator",
    userName: "admin",
    passwordRaw: "Admin123!",
    roleName: "ADMIN",
  },
  {
    name: "Inventory Manager",
    userName: "manager",
    passwordRaw: "Manager123!",
    roleName: "MANAGER",
  },
  {
    name: "Main POS Cashier",
    userName: "cashier",
    passwordRaw: "Cashier123!",
    roleName: "CASHIER",
  },
  {
    name: "Secondary Cashier",
    userName: "cashier2",
    passwordRaw: "Cashier123!",
    roleName: "CASHIER",
  },
];
