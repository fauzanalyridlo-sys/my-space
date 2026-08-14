import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function HistoryPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const userId = Number(session.user.id);

    const [checkIns, reflections] = await Promise.all([
    prisma.dailyCheckIn.findMany({
      where: {
        userId,
      },
      orderBy: {
        date: "desc",
      },
    }),

    prisma.dailyReflection.findMany({
      where: {
        userId,
      },
      orderBy: {
        date: "desc",
      },
    }),
  ]);

  const history = new Map<
    string,
    {
      date: Date;
      checkIn?: (typeof checkIns)[number];
      reflection?: (typeof reflections)[number];
    }
  >();

  for (const checkIn of checkIns) {
    const key = checkIn.date.toISOString().slice(0, 10);

    history.set(key, {
      date: checkIn.date,
      checkIn,
    });
  }

  for (const reflection of reflections) {
    const key = reflection.date.toISOString().slice(0, 10);

    const existing = history.get(key);

    history.set(key, {
      date: reflection.date,
      checkIn: existing?.checkIn,
      reflection,
    });
  }

  const entries = Array.from(history.values()).sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-10">
      <p className="text-lg text-zinc-500">
        Your journey
      </p>

      <h1 className="mt-3 text-5xl font-bold tracking-tight">
        History
      </h1>

      <p className="mt-4 text-xl text-zinc-500">
        Look back at your days.
      </p>

      <section className="mt-12 space-y-6">
        {entries.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 p-8 text-center">
            <p className="text-zinc-400">
              No history yet.
            </p>
          </div>
        ) : (
          entries.map((entry) => (
            <article
              key={entry.date.toISOString()}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
            >
              <h2 className="text-xl font-semibold">
                {entry.date.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </h2>

              {entry.checkIn && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium">
                    Daily Check-in
                  </h3>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-zinc-900 p-4">
                      <p className="text-sm text-zinc-500">
                        Mood
                      </p>
                      <p className="mt-1 text-lg">
                        {entry.checkIn.mood}/5
                      </p>
                    </div>

                    <div className="rounded-xl bg-zinc-900 p-4">
                      <p className="text-sm text-zinc-500">
                        Energy
                      </p>
                      <p className="mt-1 text-lg">
                        {entry.checkIn.energy}/5
                      </p>
                    </div>

                    <div className="rounded-xl bg-zinc-900 p-4">
                      <p className="text-sm text-zinc-500">
                        Sleep
                      </p>
                      <p className="mt-1 text-lg">
                        {entry.checkIn.sleepHours
                          ? `${entry.checkIn.sleepHours} hours`
                          : "—"}
                      </p>
                    </div>
                  </div>

                  {entry.checkIn.activities.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-zinc-500">
                        Activities
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {entry.checkIn.activities.map(
                          (activity) => (
                            <span
                              key={activity}
                              className="rounded-full border border-zinc-700 px-3 py-1 text-sm"
                            >
                              {activity}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {entry.reflection && (
                <div className="mt-8 border-t border-zinc-800 pt-6">
                  <h3 className="text-lg font-medium">
                    Reflection
                  </h3>

                  <div className="mt-4 space-y-5">
                    <div>
                      <p className="text-sm text-zinc-500">
                        How was your day?
                      </p>
                      <p className="mt-1 whitespace-pre-wrap">
                        {entry.reflection.howWasYourDay}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-zinc-500">
                        What did you learn?
                      </p>
                      <p className="mt-1 whitespace-pre-wrap">
                        {entry.reflection.whatDidYouLearn}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-zinc-500">
                        Tomorrow
                      </p>
                      <p className="mt-1 whitespace-pre-wrap">
                        {entry.reflection.tomorrow}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-zinc-500">
                        Let go
                      </p>
                      <p className="mt-1 whitespace-pre-wrap">
                        {entry.reflection.letGo}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </article>
          ))
        )}
      </section>
    </main>
  );
}
