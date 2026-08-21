import "dotenv/config";
import { prisma } from "./src/lib/prisma";
import { ValidatePassword } from "./src/lib/password-utils";

async function main() {
  const user = await prisma.user.findUnique({
    where: { userName: "admin" },
  });

  if (!user) {
    console.log("Admin user not found");
    return;
  }

  console.log("Admin user found:", user.userName);
  console.log("Admin user password hash:", user.password);

  const isValid = await ValidatePassword("test1234", user.password);
  console.log("Is 'test1234' valid for admin?:", isValid);
  
  const isValidAdmin = await ValidatePassword("admin", user.password);
  console.log("Is 'admin' valid for admin?:", isValidAdmin);
}

main().catch(console.error).finally(() => prisma.$disconnect());
