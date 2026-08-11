"use client";

import { useState } from "react";
import {
  deleteNote,
  updateNote,
} from "@/app/actions";

type NoteCardProps = {
  id: number;
  content: string;
};

export default function NoteCard({
  id,
  content,
}: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(content);

  if (isEditing) {
    return (
      <article className="rounded-lg border border-zinc-200 bg-white p-4">
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="min-h-32 w-full rounded-lg border border-zinc-300 p-3 text-black outline-none focus:border-zinc-500"
        />

        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setValue(content);
              setIsEditing(false);
            }}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-black hover:bg-zinc-100"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={async () => {
              await updateNote(id, value);
              setIsEditing(false);
            }}
            className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-zinc-800"
          >
            Save
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4">
      <p className="whitespace-pre-wrap text-zinc-800">
        {content}
      </p>

      <div className="mt-4 flex justify-end gap-2">
  <button
    type="button"
    onClick={() => setIsEditing(true)}
    className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-black hover:bg-zinc-100"
  >
    Edit
  </button>

  <button
    type="button"
    onClick={async () => {
      const confirmed = window.confirm(
        "Yakin ingin menghapus note ini?"
      );

      if (!confirmed) {
        return;
      }

      await deleteNote(id);
    }}
    className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
  >
    Delete
  </button>
</div>
    </article>
  );
}