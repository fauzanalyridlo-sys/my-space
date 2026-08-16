"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Conversation = {
  id: number;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    messages: number;
  };
};

export default function AIHistoryPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    async function loadConversations() {
      try {
        const response = await fetch("/api/ai/conversations");

        if (!response.ok) {
          throw new Error("Gagal mengambil conversation");
        }

        const data = await response.json();
        setConversations(data.conversations ?? []);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat riwayat AI.");
      } finally {
        setLoading(false);
      }
    }

    loadConversations();
  }, []);

  function startRename(conversation: Conversation) {
    setEditingId(conversation.id);
    setEditTitle(conversation.title || "");
  }

  function cancelRename() {
    setEditingId(null);
    setEditTitle("");
  }

  async function saveRename(id: number) {
    const title = editTitle.trim();

    if (!title) {
      return;
    }

    setSavingId(id);

    try {
      const response = await fetch(`/api/ai/conversations/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal rename conversation");
      }

      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === id
            ? {
                ...conversation,
                title: data.conversation.title,
                updatedAt: data.conversation.updatedAt,
              }
            : conversation,
        ),
      );

      cancelRename();
    } catch (err) {
      console.error(err);
      setError("Gagal mengubah nama conversation.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          AI History
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Riwayat percakapan kamu dengan AI.
        </p>
      </div>

      {loading && (
        <div className="rounded-xl border border-zinc-800 p-6 text-sm text-zinc-500">
          Memuat riwayat...
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-900 bg-red-950/30 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {!loading && conversations.length === 0 && (
        <div className="rounded-xl border border-zinc-800 p-8 text-center">
          <p className="text-zinc-400">
            Belum ada percakapan dengan AI.
          </p>

          <Link
            href="/ai"
            className="mt-4 inline-block text-sm underline underline-offset-4"
          >
            Mulai Chat
          </Link>
        </div>
      )}

      {!loading && conversations.length > 0 && (
  <div className="space-y-3">
    {conversations.map((conversation) => (
      <div
        key={conversation.id}
        className="rounded-xl border border-zinc-800 p-5 transition hover:border-zinc-600 hover:bg-zinc-900/40"
      >
        {editingId === conversation.id ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={editTitle}
              onChange={(event) => setEditTitle(event.target.value)}
              autoFocus
              className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
              placeholder="Nama conversation..."
              disabled={savingId === conversation.id}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  saveRename(conversation.id);
                }

                if (event.key === "Escape") {
                  cancelRename();
                }
              }}
            />

            <button
              type="button"
              onClick={() => saveRename(conversation.id)}
              disabled={
                savingId === conversation.id || !editTitle.trim()
              }
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {savingId === conversation.id ? "Menyimpan..." : "Simpan"}
            </button>

            <button
              type="button"
              onClick={cancelRename}
              disabled={savingId === conversation.id}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-zinc-100"
            >
              Batal
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <Link
              href={`/ai/history/${conversation.id}`}
              className="min-w-0 flex-1"
            >
              <h2 className="truncate font-medium">
                {conversation.title || "Percakapan tanpa judul"}
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                {conversation._count.messages} pesan
              </p>

              <p className="mt-1 text-xs text-zinc-600">
                {new Date(conversation.updatedAt).toLocaleString("id-ID")}
              </p>
            </Link>

            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => startRename(conversation)}
                className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-100"
              >
                Rename
              </button>

              <button
                type="button"
                onClick={async () => {
                  const confirmed = window.confirm(
                    "Hapus conversation ini?"
                  );

                  if (!confirmed) {
                    return;
                  }

                  try {
                    const response = await fetch(
                      `/api/ai/conversations/${conversation.id}`,
                      {
                        method: "DELETE",
                      }
                    );

                    const data = await response.json();

                    if (!response.ok) {
                      throw new Error(
                        data.error || "Gagal menghapus conversation"
                      );
                    }

                    setConversations((current) =>
                      current.filter(
                        (item) => item.id !== conversation.id
                      )
                    );
                  } catch (error) {
                    console.error(
                      "DELETE CONVERSATION ERROR:",
                      error
                    );
                    setError("Gagal menghapus conversation.");
                  }
                }}
                className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    ))}
  </div>
)}
    </main>
  );
}