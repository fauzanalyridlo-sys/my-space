"use client";

import { FormEvent, useState } from "react";
import AIConversationSidebar from "@/app/components/AIConversationSidebar";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AiPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = input.trim();

    if (!message || loading) {
      return;
    }

    setError("");
    setInput("");

    setMessages((current) => [
      ...current,
      {
        role: "user",
        content: message,
      },
    ]);

    setLoading(true);

    try {
      const body: {
  message: string;
  conversationId?: number;
} = {
  message,
};

if (conversationId !== null) {
  body.conversationId = conversationId;
}

const response = await fetch("/api/ai/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mendapatkan jawaban AI");
      }

      if (typeof data.conversationId === "number") {
  const isNewConversation = conversationId === null;

  setConversationId(data.conversationId);

  if (isNewConversation) {
    setRefreshKey((current) => current + 1);
  }
}

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.reply,
        },
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menghubungi AI.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-8">
      <div className="flex flex-col gap-6 lg:flex-row">
        <AIConversationSidebar
  activeConversationId={conversationId}
  refreshKey={refreshKey}
  onNewChat={() => {
    setMessages([]);
    setConversationId(null);
    setError("");
    setInput("");
  }}
/>
<div className="flex min-w-0 flex-1 flex-col">
      <div className="mb-6 flex items-center justify-between">
  <div>
    <h1 className="text-3xl font-semibold">AI Assistant</h1>
    <p className="mt-2 text-sm text-gray-500">
      Ceritakan sesuatu atau tanyakan apa saja.
    </p>
  </div>

  <button
    type="button"
    onClick={() => {
      setMessages([]);
      setConversationId(null);
      setError("");
      setInput("");
    }}
    className="rounded-xl border px-4 py-2 text-sm hover:bg-zinc-100"
  >
    + New Chat
  </button>
</div>

      <div className="mb-4 flex-1 space-y-4">
        {messages.length === 0 && (
          <div className="rounded-2xl border p-6 text-sm text-gray-500">
            Halo 👋 Ada yang ingin kamu bicarakan?
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "bg-black text-white"
                  : "border bg-white text-black"
              }`}
            >
              <p className="whitespace-pre-wrap text-sm">
                {message.content}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl border px-4 py-3 text-sm text-gray-500">
              AI sedang berpikir...
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Tulis pesan..."
          disabled={loading}
          className="min-w-0 flex-1 rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2"
        />

        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "..." : "Kirim"}
        </button>
      </form>

      {conversationId && (
        <p className="mt-2 text-xs text-gray-400">
          Conversation #{conversationId}
        </p>
      )}
      </div>
      </div>
    </main>
  );
}
