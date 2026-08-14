import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import NoteEditor from "./components/NoteEditor";
import NoteCard from "./components/NoteCard";

export default async function Home() {
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
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">
        My Space
      </h1>

      <p className="mt-2 text-zinc-600">
        What&apos;s on your mind?
      </p>

      <NoteEditor />

      <section className="mt-12 max-w-2xl">
        <h2 className="text-xl font-semibold">
          Recent Notes
        </h2>

        <div className="mt-4 space-y-4">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              id={note.id}
              content={note.content}
            />
          ))}
        </div>
      </section>
    </main>
  );
}