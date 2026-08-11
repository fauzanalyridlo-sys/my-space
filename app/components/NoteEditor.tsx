"use client";

import { createNote } from "@/app/actions";

export default function NoteEditor() {
  return (
    <form action={createNote} className="mt-6 max-w-2xl">
      <textarea
        name="content"
        placeholder="Tulis sesuatu..."
        className="min-h-48 w-full rounded-lg border border-zinc-300 bg-white p-4 text-black outline-none focus:border-zinc-500"
      />

      <div className="mt-2 flex justify-end">
        <button
          type="submit"
          className="rounded-lg bg-black px-4 py-2 text-white hover:bg-zinc-800"
        >
          Save Note
        </button>
      </div>
    </form>
  );
}