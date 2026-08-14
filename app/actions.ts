"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function getUserId() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = Number(session.user.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid user session");
  }

  return userId;
}

function validateNoteContent(content: unknown) {
  if (typeof content !== "string") {
    throw new Error("Content harus berupa teks.");
  }

  const trimmedContent = content.trim();

  if (!trimmedContent) {
    throw new Error("Catatan tidak boleh kosong.");
  }

  if (trimmedContent.length > 5000) {
    throw new Error("Catatan terlalu panjang. Maksimal 5000 karakter.");
  }

  return trimmedContent;
}

export async function createNote(formData: FormData) {
  const userId = await getUserId();

  const content = validateNoteContent(formData.get("content"));

  try {
    await prisma.note.create({
      data: {
        content,
        userId,
      },
    });

    revalidatePath("/notes");
  } catch (error) {
    console.error("createNote error:", error);
    throw new Error("Gagal membuat catatan.");
  }
}

export async function updateNote(id: number, content: string) {
  const userId = await getUserId();

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("ID catatan tidak valid.");
  }

  const trimmedContent = validateNoteContent(content);

  try {
    await prisma.note.update({
      where: {
        id,
        userId,
      },
      data: {
        content: trimmedContent,
      },
    });

    revalidatePath("/notes");
  } catch (error) {
    console.error("updateNote error:", error);
    throw new Error("Catatan tidak ditemukan atau gagal diperbarui.");
  }
}

export async function deleteNote(id: number) {
  const userId = await getUserId();

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("ID catatan tidak valid.");
  }

  try {
    await prisma.note.delete({
      where: {
        id,
        userId,
      },
    });

    revalidatePath("/notes");
  } catch (error) {
    console.error("deleteNote error:", error);
    throw new Error("Catatan tidak ditemukan atau gagal dihapus.");
  }
}

type ReflectionData = {
  howWasYourDay: string;
  whatDidYouLearn: string;
  tomorrow: string;
  letGo: string;
};

function validateReflection(data: ReflectionData) {
  const fields = [
    ["howWasYourDay", data.howWasYourDay],
    ["whatDidYouLearn", data.whatDidYouLearn],
    ["tomorrow", data.tomorrow],
    ["letGo", data.letGo],
  ] as const;

  for (const [name, value] of fields) {
    if (typeof value !== "string") {
      throw new Error(`${name} harus berupa teks.`);
    }

    if (value.trim().length > 5000) {
      throw new Error(`${name} terlalu panjang.`);
    }
  }

  return {
    howWasYourDay: data.howWasYourDay.trim(),
    whatDidYouLearn: data.whatDidYouLearn.trim(),
    tomorrow: data.tomorrow.trim(),
    letGo: data.letGo.trim(),
  };
}

export async function saveReflection(data: ReflectionData) {
  const userId = await getUserId();

  const reflection = validateReflection(data);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    await prisma.dailyReflection.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: reflection,
      create: {
        userId,
        date: today,
        ...reflection,
      },
    });

    revalidatePath("/reflection");
  } catch (error) {
    console.error("saveReflection error:", error);
    throw new Error("Gagal menyimpan reflection.");
  }
}

type CheckInData = {
  mood: number;
  energy: number;
  sleepHours: number | null;
  activities: string[];
};

const allowedActivities = [
  "Work",
  "Study",
  "Gym",
  "Run",
  "Rest",
];

function validateCheckIn(data: CheckInData) {
  if (!Number.isInteger(data.mood) || data.mood < 1 || data.mood > 5) {
    throw new Error("Mood harus antara 1 sampai 5.");
  }

  if (
    !Number.isInteger(data.energy) ||
    data.energy < 1 ||
    data.energy > 5
  ) {
    throw new Error("Energy harus antara 1 sampai 5.");
  }

  if (data.sleepHours !== null) {
    if (
      typeof data.sleepHours !== "number" ||
      !Number.isFinite(data.sleepHours) ||
      data.sleepHours < 0 ||
      data.sleepHours > 24
    ) {
      throw new Error("Sleep hours harus antara 0 sampai 24.");
    }
  }

  if (!Array.isArray(data.activities)) {
    throw new Error("Activities tidak valid.");
  }

  const invalidActivity = data.activities.some(
    (activity) => !allowedActivities.includes(activity),
  );

  if (invalidActivity) {
    throw new Error("Activity tidak valid.");
  }

  return {
    mood: data.mood,
    energy: data.energy,
    sleepHours: data.sleepHours,
    activities: data.activities,
  };
}

export async function saveCheckIn(data: CheckInData) {
  const userId = await getUserId();

  const checkIn = validateCheckIn(data);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    await prisma.dailyCheckIn.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: checkIn,
      create: {
        userId,
        date: today,
        ...checkIn,
      },
    });

    revalidatePath("/check-in");
  } catch (error) {
    console.error("saveCheckIn error:", error);
    throw new Error("Gagal menyimpan check-in.");
  }
}