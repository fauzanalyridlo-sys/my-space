"use client";

import { useState } from "react";
import { addSong } from "@/app/actions";

export default function AddSongForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError("");

    try {
      await addSong(formData);

      setIsOpen(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setError("");
          setIsOpen(true);
        }}
        className="mt-6 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900"
      >
        + Add Song
      </button>
    );
  }

  return (
    <form
      action={handleSubmit}
      className="mt-6 rounded-xl border border-zinc-800 p-5"
    >
      <h3 className="text-lg font-semibold">
        Add New Song
      </h3>

      <div className="mt-5 space-y-4">

        {/* SONG TITLE */}
        <div>
          <label className="mb-1 block text-sm text-zinc-400">
            Song Title
          </label>

          <input
            type="text"
            name="title"
            required
            placeholder="Last Night on Earth"
            className="w-full rounded-lg border border-zinc-700 bg-transparent px-3 py-2 outline-none focus:border-white"
          />
        </div>

        {/* ARTIST */}
        <div>
          <label className="mb-1 block text-sm text-zinc-400">
            Artist
          </label>

          <input
            type="text"
            name="artist"
            required
            placeholder="Artist name"
            className="w-full rounded-lg border border-zinc-700 bg-transparent px-3 py-2 outline-none focus:border-white"
          />
        </div>

        {/* DURATION */}
        <div>
          <label className="mb-1 block text-sm text-zinc-400">
            Duration (seconds)
          </label>

          <input
            type="number"
            name="duration"
            min="1"
            required
            placeholder="236"
            className="w-full rounded-lg border border-zinc-700 bg-transparent px-3 py-2 outline-none focus:border-white"
          />

          <p className="mt-1 text-xs text-zinc-600">
            Contoh: 236 = 3 menit 56 detik
          </p>
        </div>

        {/* MP3 */}
        <div>
          <label className="mb-1 block text-sm text-zinc-400">
            MP3 File
          </label>

          <input
            type="file"
            name="audio"
            accept=".mp3,audio/mpeg"
            required
            className="block w-full cursor-pointer rounded-lg border border-zinc-700 bg-transparent px-3 py-2 text-sm text-zinc-400 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-800 file:px-3 file:py-2 file:text-sm file:text-white"
          />

          <p className="mt-1 text-xs text-zinc-600">
            Pilih file musik dengan format .mp3
          </p>
        </div>

        {/* LRC */}
        <div>
          <label className="mb-1 block text-sm text-zinc-400">
            Lyrics File (.lrc)
          </label>

          <input
            type="file"
            name="lyrics"
            accept=".lrc,text/plain"
            required
            className="block w-full cursor-pointer rounded-lg border border-zinc-700 bg-transparent px-3 py-2 text-sm text-zinc-400 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-800 file:px-3 file:py-2 file:text-sm file:text-white"
          />

          <p className="mt-1 text-xs text-zinc-600">
            Pilih file lirik dengan timestamp .lrc
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="rounded-lg border border-red-900 bg-red-950/30 px-3 py-2">
            <p className="text-sm text-red-400">
              {error}
            </p>
          </div>
        )}

        {/* BUTTON */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Uploading..." : "Add Song"}
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              setError("");
              setIsOpen(false);
            }}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm transition hover:bg-zinc-900 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>

      </div>
    </form>
  );
}