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
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleUpdate() {
    if (isSaving || isDeleting) return;

    const trimmedValue = value.trim();

    if (!trimmedValue) {
      setError("Catatan tidak boleh kosong.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      await updateNote(id, trimmedValue);

      setValue(trimmedValue);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      setError("Gagal memperbarui catatan. Coba lagi.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (isSaving || isDeleting) return;

    const confirmed = window.confirm(
      "Yakin ingin menghapus note ini?",
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      await deleteNote(id);
    } catch (error) {
      console.error(error);
      setError("Gagal menghapus catatan. Coba lagi.");
      setIsDeleting(false);
    }
  }

  function handleCancel() {
    if (isSaving || isDeleting) return;

    setValue(content);
    setError("");
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <article className="rounded-lg border border-zinc-200 bg-white p-4">
        <textarea
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setError("");
          }}
          disabled={isSaving}
          maxLength={5000}
          className="min-h-32 w-full rounded-lg border border-zinc-300 p-3 text-black outline-none focus:border-zinc-500 disabled:cursor-not-allowed disabled:bg-zinc-100"
        />

        <div className="mt-2 text-right text-xs text-zinc-400">
          {value.length}/5000
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-500">
            {error}
          </p>
        )}

        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-black hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleUpdate}
            disabled={isSaving}
            className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4">
      <p className="whitespace-pre-wrap break-words text-zinc-800">
        {content}
      </p>

      {error && (
        <p className="mt-3 text-sm text-red-500">
          {error}
        </p>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setError("");
            setIsEditing(true);
          }}
          disabled={isDeleting}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-black hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </article>
  );
}