import { prisma } from "@/lib/prisma";
import CheckInForm from "@/app/components/CheckInForm";
import { auth } from "@/auth";

export default async function CheckInPage() {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

 const session = await auth();

if (!session?.user?.id) {
  return null;
}

const userId = Number(session.user.id);

const checkIn = await prisma.dailyCheckIn.findUnique({
  where: {
    userId_date: {
      userId,
      date: today,
    },
  },
});

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-10">
      <p className="text-lg text-zinc-500">
        Daily Check-in
      </p>

      <h1 className="mt-4 text-5xl font-bold tracking-tight">
        How are you doing?
      </h1>

      <p className="mt-4 text-xl text-zinc-500">
        A quick check-in before you continue your day.
      </p>

      <div className="mt-12">
        <CheckInForm
          initialData={
            checkIn
              ? {
                  mood: checkIn.mood,
                  energy: checkIn.energy,
                  sleepHours: checkIn.sleepHours,
                  activities: checkIn.activities,
                }
              : undefined
          }
        />
      </div>
    </main>
  );
}