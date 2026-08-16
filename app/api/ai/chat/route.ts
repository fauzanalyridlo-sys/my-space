import { NextResponse } from "next/server";
import { getSession } from "@/auth";
import { prisma } from "@/lib/prisma";
import { chatWithAI, type AIMessage } from "@/lib/ai";
import { getUserAIContext } from "@/lib/ai/context";
import {
  getUserAIMemories,
  saveUserAIMemory,
  deleteUserAIMemory,
} from "@/lib/ai/memory";
import { extractAIMemory } from "@/lib/ai/memory-extractor";
import { parseAIMemoryCommand } from "@/lib/ai/memory-command";

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

        const userId = Number(session.user.id);
const memoryCommand = parseAIMemoryCommand(message);

    const conversationId =
  typeof body.conversationId === "number"
    ? body.conversationId
    : null;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    

    let conversation;
    if (conversationId !== null) {
      if (!Number.isInteger(conversationId)) {
        return NextResponse.json(
          { error: "Invalid conversationId" },
          { status: 400 },
        );
      }

      conversation = await prisma.aiConversation.findFirst({
        where: {
          id: conversationId,
          userId,
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
        return NextResponse.json(
          { error: "Conversation not found" },
          { status: 404 },
        );
      }
    } else {
      conversation = await prisma.aiConversation.create({
        data: {
          userId,
          title: message.slice(0, 80),
        },
        include: {
          messages: true,
        },
      });
    }
if (memoryCommand.type === "forget") {
  const result = await deleteUserAIMemory(
    userId,
    memoryCommand.key,
  );

  const reply =
    result.count > 0
      ? "Oke, aku sudah melupakan informasi tersebut."
      : "Oke, tidak ada informasi tersebut yang tersimpan.";

  await prisma.aiMessage.createMany({
    data: [
      {
        conversationId: conversation.id,
        role: "user",
        content: message,
      },
      {
        conversationId: conversation.id,
        role: "assistant",
        content: reply,
      },
    ],
  });

  await prisma.aiConversation.update({
    where: {
      id: conversation.id,
    },
    data: {
      updatedAt: new Date(),
    },
  });

  return NextResponse.json({
    conversationId: conversation.id,
    reply,
  });
}
    await prisma.aiMessage.create({
      
      data: {
        conversationId: conversation.id,
        role: "user",
        content: message,
      },
    });

    const history = await prisma.aiMessage.findMany({
  where: {
    conversationId: conversation.id,
  },
  orderBy: {
    createdAt: "desc",
  },
  take: 20,
  select: {
    role: true,
    content: true,
  },
});

history.reverse();

    const messages: AIMessage[] = history.map((item) => ({
      role: item.role === "assistant" ? "assistant" : "user",
      content: item.content,
    }));

    const context = await getUserAIContext(userId);
    const memories = await getUserAIMemories(userId);

   const reply = await chatWithAI(messages, context, memories);
  if (memoryCommand.type === "none") {
  const extractedMemory = await extractAIMemory(message);

  if (extractedMemory) {
    await saveUserAIMemory(
      userId,
      extractedMemory.key,
      extractedMemory.value,
    );
  }
}
    await prisma.aiMessage.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: reply,
      },
    });

    await prisma.aiConversation.update({
      where: {
        id: conversation.id,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      conversationId: conversation.id,
      reply,
    });
  } catch (error) {
    console.error("AI CHAT ERROR:", error);

    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 },
    );
  }
}