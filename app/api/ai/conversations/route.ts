import { NextResponse } from "next/server";
import { getSession } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const userId = Number(session.user.id);

    const conversations = await prisma.aiConversation.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("AI CONVERSATIONS ERROR:", error);

    return NextResponse.json(
      { error: "Failed to get conversations" },
      { status: 500 },
    );
  }
}
