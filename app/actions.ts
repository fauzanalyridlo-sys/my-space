"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createNote(formData: FormData) {
  const content = formData.get("content");

  if (typeof content !== "string") {
    return;
  }

  const trimmedContent = content.trim();

  if (!trimmedContent) {
    return;
  }

  await prisma.note.create({
    data: {
      content: trimmedContent,
    },
  });

  revalidatePath("/");
}

export async function updateNote(id: number, content: string) {
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    return;
  }

  await prisma.note.update({
    where: {
      id,
    },
    data: {
      content: trimmedContent,
    },
  });

  revalidatePath("/");
}

export async function deleteNote(id: number) {
  await prisma.note.delete({
    where: {
      id,
    },
  });

  revalidatePath("/");
}