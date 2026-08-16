import { prisma } from "@/lib/prisma";

export async function getUserAIMemories(userId: number) {
  return prisma.aiMemory.findMany({
    where: {
      userId,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export async function saveUserAIMemory(
  userId: number,
  key: string,
  value: string,
) {

  return prisma.aiMemory.upsert({
    where: {
      userId_key: {
        userId,
        key,
      },
    },
    update: {
      value,
    },
    create: {
      userId,
      key,
      value,
    },
  });
}
export async function deleteUserAIMemory(
  userId: number,
  key: string,
) {
  return prisma.aiMemory.deleteMany({
    where: {
      userId,
      key,
    },
  });
}