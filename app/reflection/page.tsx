import { prisma } from "@/lib/prisma";
import ReflectionForm from "@/app/components/ReflectionForm";
import ReflectionHistory from "@/app/components/ReflectionHistory";
import { auth } from "@/auth";

export default async function ReflectionPage() {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const session = await auth();

if (!session?.user?.id) {
  return null;
}

const userId = Number(session.user.id);

const reflection = await prisma.dailyReflection.findUnique({
  where: {
    userId_date: {
      userId,
      date: today,
    },
  },
});

  const reflections = await prisma.dailyReflection.findMany({
  where: {
    userId,
  },
  orderBy: {
    date: "desc",
  },
});

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">
          Daily Reflection
        </h1>

        <p className="mt-2 text-zinc-500">
          Take a moment to look back at your day.
        </p>

        <ReflectionForm
          initialData={
            reflection
              ? {
                  howWasYourDay: reflection.howWasYourDay,
                  whatDidYouLearn: reflection.whatDidYouLearn,
                  tomorrow: reflection.tomorrow,
                  letGo: reflection.letGo,
                }
              : undefined
          }
        />

        <ReflectionHistory reflections={reflections} />
      </div>
    </main>
  );
}