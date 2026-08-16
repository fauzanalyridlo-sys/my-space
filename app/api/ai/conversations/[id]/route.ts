import { NextResponse } from "next/server";
import { getSession } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const userId = Number(session.user.id);
    const { id } = await params;
    const conversationId = Number(id);

    if (!Number.isInteger(conversationId)) {
      return NextResponse.json(
        { error: "Invalid conversation id" },
        { status: 400 },
      );
    }

    const conversation = await prisma.aiConversation.findFirst({
      where: {
        id: conversationId,
        userId,
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        messages: {
          orderBy: {
            createdAt: "asc",
          },
          select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,
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

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("AI CONVERSATION GET ERROR:", error);

    return NextResponse.json(
      { error: "Failed to get conversation" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const userId = Number(session.user.id);
    const { id } = await params;
    const conversationId = Number(id);

    if (!Number.isInteger(conversationId)) {
      return NextResponse.json(
        { error: "Invalid conversation id" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 },
      );
    }

    if (title.length > 80) {
      return NextResponse.json(
        { error: "Title must be 80 characters or less" },
        { status: 400 },
      );
    }

    const conversation = await prisma.aiConversation.findFirst({
      where: {
        id: conversationId,
        userId,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    const updatedConversation =
      await prisma.aiConversation.update({
        where: {
          id: conversationId,
        },
        data: {
          title,
        },
        select: {
          id: true,
          title: true,
          updatedAt: true,
        },
      });

    return NextResponse.json({
      conversation: updatedConversation,
    });
  } catch (error) {
    console.error("AI CONVERSATION PATCH ERROR:", error);

    return NextResponse.json(
      { error: "Failed to rename conversation" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const userId = Number(session.user.id);
    const { id } = await params;
    const conversationId = Number(id);

    if (!Number.isInteger(conversationId)) {
      return NextResponse.json(
        { error: "Invalid conversation id" },
        { status: 400 },
      );
    }

    const conversation = await prisma.aiConversation.findFirst({
      where: {
        id: conversationId,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    await prisma.aiConversation.delete({
      where: {
        id: conversation.id,
      },
    });

    return NextResponse.json({
      success: true,
      id: conversation.id,
    });
  } catch (error) {
    console.error("AI CONVERSATION DELETE ERROR:", error);

    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 },
    );
  }
}

