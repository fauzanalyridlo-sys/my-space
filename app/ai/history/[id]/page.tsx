import AIConversationChat from "@/app/components/AIConversationChat";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ConversationPage({
  params,
}: PageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const { id } = await params;
  const conversationId = Number(id);

  if (!Number.isInteger(conversationId)) {
    notFound();
  }

  const conversation = await prisma.aiConversation.findFirst({
    where: {
      id: conversationId,
      userId: Number(session.user.id),
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!conversation) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <Link
          href="/ai/history"
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          ← Kembali ke History
        </Link>

        <h1 className="mt-4 text-2xl font-semibold">
          {conversation.title || "Percakapan AI"}
        </h1>
      </div>

      <div className="space-y-4">
        <AIConversationChat
  conversationId={conversation.id}
  initialMessages={conversation.messages}
/>
      </div>
    </main>
  );
}
