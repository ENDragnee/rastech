export interface UserSeed {
  name: string;
  userName: string;
  passwordRaw: string;
  roleNames: ("ADMIN" | "MANAGER" | "CASHIER")[];
}

export const usersData: UserSeed[] = [
  {
    name: "System Administrator",
    userName: "admin",
    passwordRaw: "Admin123!",
    roleNames: ["ADMIN", "MANAGER"],
  },
  {
    name: "Inventory Manager",
    userName: "manager",
    passwordRaw: "Manager123!",
    roleNames: ["MANAGER"],
  },
  {
    name: "Main POS Cashier",
    userName: "cashier",
    passwordRaw: "Cashier123!",
    roleNames: ["CASHIER"],
  },
  {
    name: "Secondary Cashier",
    userName: "cashier2",
    passwordRaw: "Cashier123!",
    roleNames: ["CASHIER"],
  },
];
