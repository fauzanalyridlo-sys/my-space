import { prisma } from "@/lib/prisma";

export async function getUserAIContext(userId: number) {
  const [checkIns, reflections, notes] = await Promise.all([
    prisma.dailyCheckIn.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 7,
      select: {
        date: true,
        mood: true,
        energy: true,
        sleepHours: true,
        activities: true,
      },
    }),

    prisma.dailyReflection.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 7,
      select: {
        date: true,
        howWasYourDay: true,
        whatDidYouLearn: true,
        tomorrow: true,
        letGo: true,
      },
    }),

    prisma.note.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        content: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    checkIns,
    reflections,
    notes,
  };
}
