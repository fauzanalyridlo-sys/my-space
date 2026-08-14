import "dotenv/config";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

async function main() {
  const email = process.env.USER_EMAIL;
  const password = process.env.USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "USER_EMAIL dan USER_PASSWORD wajib diisi.",
    );
  }

  const passwordHash = await hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
    },
  });

  console.log("User berhasil dibuat:");
  console.log(user);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });