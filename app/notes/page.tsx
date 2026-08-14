import { prisma } from "@/lib/prisma";
import NoteEditor from "@/app/components/NoteEditor";
import NoteCard from "@/app/components/NoteCard";
import { auth } from "@/auth";

export default async function NotesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const userId = Number(session.user.id);

  const notes = await prisma.note.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <section>
          <p className="text-sm text-zinc-500">
            Thoughts & Ideas
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            Notes
          </h1>

          <p className="mt-3 text-zinc-500">
            Tempat menyimpan hal-hal yang ingin kamu ingat.
          </p>
        </section>

        <section className="mt-10">
          <NoteEditor />
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">
            All Notes
          </h2>

          <div className="mt-6 space-y-4">
            {notes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center">
                <p className="text-zinc-500">
                  Belum ada catatan.
                </p>
              </div>
            ) : (
              notes.map((note) => (
                <NoteCard
                  key={note.id}
                  id={note.id}
                  content={note.content}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}