"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Message = {
  id: number;
  role: string;
  content: string;
  createdAt: Date;
};

type Props = {
  conversationId: number;
  initialMessages: Message[];
};

export default function AIConversationChat({
  conversationId,
  initialMessages,
}: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({
    behavior: "smooth",
  });
}, [messages, loading]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = message.trim();

    if (!text || loading) {
      return;
    }

    setMessage("");
    setLoading(true);

    const temporaryMessage: Message = {
      id: Date.now(),
      role: "user",
      content: text,
      createdAt: new Date(),
    };

    setMessages((current) => [...current, temporaryMessage]);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          message: text,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.reply,
        createdAt: new Date(),
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch (error) {
      console.error("CHAT ERROR:", error);

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 2,
          role: "assistant",
          content: "Maaf, terjadi kesalahan. Coba lagi.",
          createdAt: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {messages.map((item) => (
          <div
            key={item.id}
            className={
              item.role === "user"
                ? "ml-auto max-w-[85%] rounded-2xl bg-black px-4 py-3 text-white"
                : "mr-auto max-w-[85%] rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900"
            }
          >
            <p className="mb-1 text-xs font-medium opacity-60">
              {item.role === "user" ? "You" : "AI"}
            </p>

            <p className="whitespace-pre-wrap text-sm leading-6">
              {item.content}
            </p>
          </div>
        ))}

        {loading && (
          <div className="mr-auto rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-500">
            AI sedang mengetik...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex gap-2"
      >
        <textarea
  value={message}
  onChange={(event) => setMessage(event.target.value)}
  onKeyDown={(event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      if (!loading && message.trim()) {
        event.currentTarget.form?.requestSubmit();
      }
    }
  }}
  placeholder="Tulis pesan..."
  disabled={loading}
  rows={1}
  className="min-h-12 flex-1 resize-none rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-500"
/>

        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "..." : "Kirim"}
        </button>
      </form>
    </div>
  );
}
