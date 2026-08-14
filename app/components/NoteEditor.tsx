"use client";

import { createNote } from "@/app/actions";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

type NoteState = {
  error?: string;
  success?: boolean;
};

const initialState: NoteState = {};

async function createNoteAction(
  _prevState: NoteState,
  formData: FormData,
): Promise<NoteState> {
  try {
    await createNote(formData);

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    return {
      error:
        error instanceof Error
          ? error.message
          : "Gagal menyimpan catatan.",
    };
  }
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-black px-4 py-2 text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Saving..." : "Save Note"}
    </button>
  );
}

function NoteForm() {
  const { pending } = useFormStatus();

  return (
    <>
      <textarea
        name="content"
        placeholder="Tulis sesuatu..."
        disabled={pending}
        className="min-h-48 w-full rounded-lg border border-zinc-300 bg-white p-4 text-black outline-none focus:border-zinc-500 disabled:cursor-not-allowed disabled:bg-zinc-100"
      />

      <div className="mt-2 flex justify-end">
        <SubmitButton />
      </div>
    </>
  );
}

export default function NoteEditor() {
  const [state, formAction] = useActionState(
    createNoteAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-6 max-w-2xl">
      <NoteForm />

      {state.error && (
        <p className="mt-3 text-sm text-red-400">
          {state.error}
        </p>
      )}

      {state.success && (
        <p className="mt-3 text-sm text-green-400">
          Catatan berhasil disimpan.
        </p>
      )}
    </form>
  );
}