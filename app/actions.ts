"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

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

export async function addSong(formData: FormData) {
  const userId = await getUserId();

  const title = formData.get("title");
  const artist = formData.get("artist");
  const duration = formData.get("duration");

  const audioFile = formData.get("audio");
  const lyricsFile = formData.get("lyrics");

  // =========================
  // VALIDASI DATA
  // =========================

  if (typeof title !== "string" || !title.trim()) {
    throw new Error("Judul lagu wajib diisi.");
  }

  if (typeof artist !== "string" || !artist.trim()) {
    throw new Error("Artist wajib diisi.");
  }

  const durationNumber = Number(duration);

  if (
    !Number.isInteger(durationNumber) ||
    durationNumber <= 0
  ) {
    throw new Error("Durasi lagu tidak valid.");
  }

  // =========================
  // VALIDASI MP3
  // =========================

  if (!(audioFile instanceof File) || audioFile.size === 0) {
    throw new Error("File MP3 wajib dipilih.");
  }

  if (!audioFile.name.toLowerCase().endsWith(".mp3")) {
    throw new Error("File audio harus berformat MP3.");
  }

  // =========================
  // VALIDASI LRC
  // =========================

  if (!(lyricsFile instanceof File) || lyricsFile.size === 0) {
    throw new Error("File LRC wajib dipilih.");
  }

  if (!lyricsFile.name.toLowerCase().endsWith(".lrc")) {
    throw new Error("File lirik harus berformat .lrc.");
  }

  // =========================
  // BUAT ID LAGU
  // =========================

  const songId = `song_${crypto.randomUUID()}`;

  const folder = `user_${userId}/${songId}`;

  const audioPath = `${folder}/audio.mp3`;
  const lyricsPath = `${folder}/lyrics.lrc`;

  try {
    // =========================
    // UPLOAD MP3
    // =========================

    const audioBuffer = Buffer.from(
      await audioFile.arrayBuffer(),
    );

    const { error: audioError } =
      await supabase.storage
        .from("music")
        .upload(audioPath, audioBuffer, {
          contentType: "audio/mpeg",
          upsert: false,
        });

    if (audioError) {
      throw new Error(
        `Upload MP3 gagal: ${audioError.message}`,
      );
    }

    // =========================
    // UPLOAD LRC
    // =========================

    const lyricsBuffer = Buffer.from(
      await lyricsFile.arrayBuffer(),
    );

    const { error: lyricsError } =
      await supabase.storage
        .from("music")
        .upload(lyricsPath, lyricsBuffer, {
          contentType: "text/plain",
          upsert: false,
        });

    if (lyricsError) {
      // Kalau LRC gagal, hapus MP3
      await supabase.storage
        .from("music")
        .remove([audioPath]);

      throw new Error(
        `Upload LRC gagal: ${lyricsError.message}`,
      );
    }

    // =========================
    // SIMPAN DATABASE
    // =========================

    await prisma.song.create({
      data: {
        songId,
        title: title.trim(),
        artist: artist.trim(),
        audioUrl: audioPath,
        lyricsUrl: lyricsPath,
        duration: durationNumber,
        userId,
      },
    });

    revalidatePath("/music");

    return {
      success: true,
      songId,
    };
  } catch (error) {
    console.error("addSong error:", error);

    throw error instanceof Error
      ? error
      : new Error("Gagal menambahkan lagu.");
  }
}

export async function deleteSong(songId: string) {
  const userId = await getUserId();

  if (!songId) {
    throw new Error("Song ID tidak valid.");
  }

  try {
    const song = await prisma.song.findFirst({
      where: {
        songId,
        userId,
      },
    });

    if (!song) {
      throw new Error(
        "Lagu tidak ditemukan atau kamu tidak memiliki akses.",
      );
    }

    const { error: storageError } =
      await supabase.storage
        .from("music")
        .remove([
          song.audioUrl,
          song.lyricsUrl,
        ]);

    if (storageError) {
      throw new Error(
        `Gagal menghapus file dari Storage: ${storageError.message}`,
      );
    }

    await prisma.song.delete({
      where: {
        id: song.id,
      },
    });

    revalidatePath("/music");

    return {
      success: true,
    };
  } catch (error) {
    console.error("deleteSong error:", error);

    throw error instanceof Error
      ? error
      : new Error("Gagal menghapus lagu.");
  }
}

export async function updateSong(
  songId: string,
  formData: FormData,
) {
  const userId = await getUserId();

  if (!songId) {
    throw new Error("Song ID tidak valid.");
  }

  const title = formData.get("title");
  const artist = formData.get("artist");
  const duration = formData.get("duration");

  const audioFile = formData.get("audio");
  const lyricsFile = formData.get("lyrics");

  if (typeof title !== "string" || !title.trim()) {
    throw new Error("Judul lagu wajib diisi.");
  }

  if (typeof artist !== "string" || !artist.trim()) {
    throw new Error("Artist wajib diisi.");
  }

  const durationNumber = Number(duration);

  if (
    !Number.isInteger(durationNumber) ||
    durationNumber <= 0
  ) {
    throw new Error("Durasi lagu tidak valid.");
  }

  try {
    const song = await prisma.song.findFirst({
      where: {
        songId,
        userId,
      },
    });

    if (!song) {
      throw new Error(
        "Lagu tidak ditemukan atau kamu tidak memiliki akses.",
      );
    }

    let audioPath = song.audioUrl;
    let lyricsPath = song.lyricsUrl;

    // =========================
    // UPDATE MP3 JIKA DIPILIH
    // =========================

    if (audioFile instanceof File && audioFile.size > 0) {
      if (!audioFile.name.toLowerCase().endsWith(".mp3")) {
        throw new Error("File audio harus berformat MP3.");
      }

      const newAudioPath =
        `user_${userId}/${song.songId}/audio.mp3`;

      const audioBuffer = Buffer.from(
        await audioFile.arrayBuffer(),
      );

      const { error } = await supabase.storage
        .from("music")
        .upload(newAudioPath, audioBuffer, {
          contentType: "audio/mpeg",
          upsert: true,
        });

      if (error) {
        throw new Error(
          `Upload MP3 gagal: ${error.message}`,
        );
      }

      audioPath = newAudioPath;
    }

    // =========================
    // UPDATE LRC JIKA DIPILIH
    // =========================

    if (lyricsFile instanceof File && lyricsFile.size > 0) {
      if (!lyricsFile.name.toLowerCase().endsWith(".lrc")) {
        throw new Error("File lirik harus berformat .lrc.");
      }

      const newLyricsPath =
        `user_${userId}/${song.songId}/lyrics.lrc`;

      const lyricsBuffer = Buffer.from(
        await lyricsFile.arrayBuffer(),
      );

      const { error } = await supabase.storage
        .from("music")
        .upload(newLyricsPath, lyricsBuffer, {
          contentType: "text/plain",
          upsert: true,
        });

      if (error) {
        throw new Error(
          `Upload LRC gagal: ${error.message}`,
        );
      }

      lyricsPath = newLyricsPath;
    }

    // =========================
    // UPDATE DATABASE
    // =========================

    await prisma.song.update({
      where: {
        id: song.id,
      },
      data: {
        title: title.trim(),
        artist: artist.trim(),
        duration: durationNumber,
        audioUrl: audioPath,
        lyricsUrl: lyricsPath,
      },
    });

    revalidatePath("/music");

    return {
      success: true,
    };
  } catch (error) {
    console.error("updateSong error:", error);

    throw error instanceof Error
      ? error
      : new Error("Gagal mengubah lagu.");
  }
}

export async function createAlarm(formData: FormData) {
  const userId = await getUserId();

  const time = formData.get("time");
  const label = formData.get("label");

  if (typeof time !== "string" || !/^\d{2}:\d{2}$/.test(time)) {
    throw new Error("Waktu alarm tidak valid.");
  }

  const [hours, minutes] = time.split(":").map(Number);

  if (
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw new Error("Waktu alarm tidak valid.");
  }

  if (typeof label !== "string" || !label.trim()) {
    throw new Error("Nama alarm wajib diisi.");
  }

    const alarm = await prisma.alarm.create({
    data: {
      time,
      label: label.trim(),
      userId,
    },
  });

  revalidatePath("/alarm");

  return {
    success: true,
    alarm,
  };
}

export async function getAlarms() {
  const userId = await getUserId();

  return prisma.alarm.findMany({
    where: {
      userId,
    },
    orderBy: {
      time: "asc",
    },
  });
}

export async function toggleAlarm(
  alarmId: number,
) {
  const userId = await getUserId();

  const alarm = await prisma.alarm.findFirst({
    where: {
      id: alarmId,
      userId,
    },
  });

  if (!alarm) {
    throw new Error(
      "Alarm tidak ditemukan atau kamu tidak memiliki akses.",
    );
  }

  await prisma.alarm.update({
    where: {
      id: alarm.id,
    },
    data: {
      enabled: !alarm.enabled,
    },
  });

  revalidatePath("/alarm");

  return {
    success: true,
    enabled: !alarm.enabled,
  };
}

export async function deleteAlarm(
  alarmId: number,
) {
  const userId = await getUserId();

  const alarm = await prisma.alarm.findFirst({
    where: {
      id: alarmId,
      userId,
    },
  });

  if (!alarm) {
    throw new Error(
      "Alarm tidak ditemukan atau kamu tidak memiliki akses.",
    );
  }

  await prisma.alarm.delete({
    where: {
      id: alarm.id,
    },
  });

  revalidatePath("/alarm");

  return {
    success: true,
  };
}

export async function createIotDevice(name: string) {
  const userId = await getUserId();

  if (typeof name !== "string" || !name.trim()) {
    throw new Error("Nama device wajib diisi.");
  }

  const deviceToken = crypto.randomUUID();

  try {
    const device = await prisma.iotDevice.create({
      data: {
        name: name.trim(),
        deviceToken,
        userId,
      },
      select: {
        id: true,
        name: true,
        deviceToken: true,
        enabled: true,
      },
    });

    return {
      success: true,
      device,
    };
  } catch (error) {
    console.error("createIotDevice error:", error);

    throw new Error("Gagal mendaftarkan IoT device.");
  }
}

export async function getIotDevices() {
  const userId = await getUserId();

  return prisma.iotDevice.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      name: true,
      deviceToken: true,
      enabled: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function toggleIotDevice(deviceId: number) {
  const userId = await getUserId();

  if (!Number.isInteger(deviceId) || deviceId <= 0) {
    throw new Error("ID device tidak valid.");
  }

  const device = await prisma.iotDevice.findFirst({
    where: {
      id: deviceId,
      userId,
    },
  });

  if (!device) {
    throw new Error(
      "Device tidak ditemukan atau kamu tidak memiliki akses.",
    );
  }

  const updatedDevice = await prisma.iotDevice.update({
    where: {
      id: device.id,
    },
    data: {
      enabled: !device.enabled,
    },
    select: {
      id: true,
      name: true,
      enabled: true,
    },
  });

  return {
    success: true,
    enabled: updatedDevice.enabled,
  };
}

export async function getSongUrls(songId: string) {
  const userId = await getUserId();

  if (!songId || typeof songId !== "string") {
    throw new Error("Song ID tidak valid.");
  }

  const song = await prisma.song.findFirst({
    where: {
      songId,
      userId,
    },
  });

  if (!song) {
    throw new Error("Lagu tidak ditemukan.");
  }

  const { data: audioData, error: audioError } =
    await supabase.storage
      .from("music")
      .createSignedUrl(song.audioUrl, 60 * 60);

  if (audioError || !audioData?.signedUrl) {
    throw new Error(
      `Gagal membuat URL MP3: ${
        audioError?.message ?? "Unknown error"
      }`,
    );
  }

  const { data: lyricsData, error: lyricsError } =
    await supabase.storage
      .from("music")
      .createSignedUrl(song.lyricsUrl, 60 * 60);

  if (lyricsError || !lyricsData?.signedUrl) {
    throw new Error(
      `Gagal membuat URL LRC: ${
        lyricsError?.message ?? "Unknown error"
      }`,
    );
  }

  return {
    audioUrl: audioData.signedUrl,
    lyricsUrl: lyricsData.signedUrl,
  };
}