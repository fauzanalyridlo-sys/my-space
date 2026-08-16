import "dotenv/config";
import { hash } from "bcryptjs";
import { prisma } from "../lib/prisma";

async function main() {
  const email = process.env.NEW_USER_EMAIL;
  const password = process.env.NEW_USER_PASSWORD;

  if (!email || !password) {
    throw new Error("NEW_USER_EMAIL dan NEW_USER_PASSWORD wajib diisi");
  }

  const passwordHash = await hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: {
      email,
      passwordHash,
    },
  });

  console.log(`User berhasil dibuat: ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
