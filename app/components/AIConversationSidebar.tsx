"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Conversation = {
  id: number;
  title: string | null;
  updatedAt: string;
  _count: {
    messages: number;
  };
};

type Props = {
  activeConversationId: number | null;
  onNewChat: () => void;
  refreshKey: number;
};

export default function AIConversationSidebar({
  activeConversationId,
  onNewChat,
  refreshKey,
}: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  let cancelled = false;

  async function load() {
    try {
      const response = await fetch("/api/ai/conversations");

      if (!response.ok) {
        throw new Error("Gagal mengambil conversation");
      }

      const data = await response.json();

      if (!cancelled) {
        setConversations(data.conversations ?? []);
      }
    } catch (error) {
      if (!cancelled) {
        console.error("LOAD AI HISTORY ERROR:", error);
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }

  load();

  return () => {
    cancelled = true;
  };
}, [refreshKey]);

  return (
    <aside className="w-full border-b border-zinc-800 pb-4 lg:w-64 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">Conversations</h2>

        <button
          type="button"
          onClick={onNewChat}
          className="rounded-lg border px-3 py-1.5 text-xs hover:bg-zinc-100"
        >
          + New
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">
          Memuat...
        </p>
      ) : conversations.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Belum ada conversation.
        </p>
      ) : (
        <div className="space-y-1">
          {conversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/ai/history/${conversation.id}`}
              className={`block rounded-lg px-3 py-2 text-sm transition ${
                activeConversationId === conversation.id
                  ? "bg-zinc-200 font-medium"
                  : "hover:bg-zinc-100"
              }`}
            >
              <p className="truncate">
                {conversation.title || "Percakapan tanpa judul"}
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                {conversation._count.messages} pesan
              </p>
            </Link>
          ))}
        </div>
      )}

      <Link
        href="/ai/history"
        className="mt-4 block text-center text-xs text-zinc-500 underline underline-offset-4"
      >
        Lihat semua history
      </Link>
    </aside>
  );
}
