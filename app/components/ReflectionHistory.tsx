type Reflection = {
  id: number;
  date: Date;
  howWasYourDay: string;
  whatDidYouLearn: string;
  tomorrow: string;
  letGo: string;
};

type ReflectionHistoryProps = {
  reflections: Reflection[];
};

export default function ReflectionHistory({
  reflections,
}: ReflectionHistoryProps) {
  if (reflections.length === 0) {
    return (
      <section className="mt-12">
        <h2 className="text-xl font-semibold">
          Previous Reflections
        </h2>

        <p className="mt-4 text-zinc-500">
          Belum ada reflection sebelumnya.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold">
        Previous Reflections
      </h2>

      <div className="mt-6 space-y-4">
        {reflections.map((reflection) => (
          <article
            key={reflection.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
          >
            <p className="text-sm font-medium text-zinc-400">
              {reflection.date.toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-zinc-400">
                  How was your day?
                </h3>

                <p className="mt-1 whitespace-pre-wrap text-zinc-200">
                  {reflection.howWasYourDay}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-zinc-400">
                  What did you learn?
                </h3>

                <p className="mt-1 whitespace-pre-wrap text-zinc-200">
                  {reflection.whatDidYouLearn}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-zinc-400">
                  Tomorrow
                </h3>

                <p className="mt-1 whitespace-pre-wrap text-zinc-200">
                  {reflection.tomorrow}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-zinc-400">
                  Something to let go
                </h3>

                <p className="mt-1 whitespace-pre-wrap text-zinc-200">
                  {reflection.letGo}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
