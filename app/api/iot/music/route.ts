import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// ======================================================
// TYPE
// ======================================================

type MusicStateResponse = {
  songId: string | null;
  title: string | null;
  artist: string | null;
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  activeLyric: string | null;
};

// ======================================================
// EMPTY MUSIC STATE
// ======================================================

const EMPTY_MUSIC_STATE: MusicStateResponse = {
  songId: null,
  title: null,
  artist: null,
  duration: 0,
  currentTime: 0,
  isPlaying: false,
  activeLyric: null,
};

// ======================================================
// GET
//
// Digunakan ESP32.
//
// ESP32 mengirim:
// x-iot-token: DEVICE_TOKEN
//
// API mencari device berdasarkan token,
// kemudian mengambil music state milik device tersebut.
// ======================================================

export async function GET(
  request: NextRequest,
) {
  try {
    // ==================================================
    // AMBIL IOT TOKEN
    // ==================================================

    const token =
      request.headers.get(
        "x-iot-token",
      );

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing IoT token.",
        },
        {
          status: 401,
        },
      );
    }

    // ==================================================
    // CARI DEVICE
    // ==================================================

    const device =
      await prisma.iotDevice.findUnique({
        where: {
          deviceToken: token,
        },

        select: {
          id: true,
          enabled: true,
        },
      });

    // ==================================================
    // DEVICE TIDAK DITEMUKAN
    // ==================================================

    if (!device) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid IoT token.",
        },
        {
          status: 401,
        },
      );
    }

    // ==================================================
    // DEVICE DINONAKTIFKAN
    // ==================================================

    if (!device.enabled) {
      return NextResponse.json(
        {
          success: false,
          error: "IoT device is disabled.",
        },
        {
          status: 403,
        },
      );
    }

    // ==================================================
    // AMBIL MUSIC STATE
    // ==================================================

    const musicState =
      await prisma.iotMusicState.findUnique({
        where: {
          deviceId: device.id,
        },
      });

    // ==================================================
    // BELUM ADA MUSIC STATE
    // ==================================================

    if (!musicState) {
      return NextResponse.json({
        success: true,
        music: EMPTY_MUSIC_STATE,
      });
    }

    // ==================================================
    // RESPONSE UNTUK ESP32
    // ==================================================

    return NextResponse.json({
      success: true,

      music: {
        songId: musicState.songId,
        title: musicState.title,
        artist: musicState.artist,
        duration: musicState.duration,
        currentTime: musicState.currentTime,
        isPlaying: musicState.isPlaying,
        activeLyric: musicState.activeLyric,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/iot/music error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: "Gagal mengambil state musik.",
      },
      {
        status: 500,
      },
    );
  }
}

// ======================================================
// POST
//
// Digunakan WEB / MusicPlayer.
//
// POST tidak menggunakan IoT token.
//
// User harus login menggunakan NextAuth.
//
// State musik akan disimpan ke IotDevice milik
// user yang sedang login.
// ======================================================

export async function POST(
  request: NextRequest,
) {
  try {
    // ==================================================
    // CEK SESSION
    // ==================================================

    const session =
      await auth();

    if (
      !session?.user?.id
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    // ==================================================
    // USER ID DARI SESSION
    // ==================================================

    const userId =
      Number(
        session.user.id,
      );

    if (
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid user session.",
        },
        {
          status: 401,
        },
      );
    }

    // ==================================================
    // PARSE REQUEST BODY
    // ==================================================

    const body =
      await request.json();

    // ==================================================
    // AMBIL DATA MUSIC
    // ==================================================

    const songId =
      body.songId == null
        ? null
        : String(
            body.songId,
          );

    const title =
      body.title == null
        ? null
        : String(
            body.title,
          );

    const artist =
      body.artist == null
        ? null
        : String(
            body.artist,
          );

    const duration =
      Number(
        body.duration ?? 0,
      );

    const currentTime =
      Number(
        body.currentTime ?? 0,
      );

    const isPlaying =
      body.isPlaying === true;

    const activeLyric =
      body.activeLyric == null
        ? null
        : String(
            body.activeLyric,
          );

    // ==================================================
    // VALIDASI DURATION
    // ==================================================

    if (
      !Number.isFinite(
        duration,
      ) ||
      duration < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid duration.",
        },
        {
          status: 400,
        },
      );
    }

    // ==================================================
    // VALIDASI CURRENT TIME
    // ==================================================

    if (
      !Number.isFinite(
        currentTime,
      ) ||
      currentTime < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid currentTime.",
        },
        {
          status: 400,
        },
      );
    }

    // ==================================================
    // CARI DEVICE MILIK USER
    //
    // INI BAGIAN PENTING.
    //
    // Tidak lagi menggunakan:
    //
    // findFirst({
    //   where: {
    //     enabled: true
    //   }
    // })
    //
    // Karena itu bisa mengambil device user lain.
    // ==================================================

    const device =
      await prisma.iotDevice.findFirst({
        where: {
          userId,
          enabled: true,
        },

        orderBy: {
          id: "asc",
        },

        select: {
          id: true,
        },
      });

    // ==================================================
    // USER BELUM MEMILIKI DEVICE
    // ==================================================

    if (!device) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Tidak ada IoT device aktif untuk user ini.",
        },
        {
          status: 404,
        },
      );
    }

    // ==================================================
    // UPSERT MUSIC STATE
    // ==================================================

    const musicState =
      await prisma.iotMusicState.upsert({
        where: {
          deviceId: device.id,
        },

        update: {
          songId,
          title,
          artist,
          duration,
          currentTime,
          isPlaying,
          activeLyric,
        },

        create: {
          deviceId: device.id,
          songId,
          title,
          artist,
          duration,
          currentTime,
          isPlaying,
          activeLyric,
        },
      });

    // ==================================================
    // LOG
    // ==================================================

    console.log(
      "IoT music state updated:",
      {
        userId,
        deviceId: device.id,
        songId,
        title,
        artist,
        duration,
        currentTime,
        isPlaying,
      },
    );

    // ==================================================
    // RESPONSE
    // ==================================================

    return NextResponse.json({
      success: true,

      music: {
        songId: musicState.songId,
        title: musicState.title,
        artist: musicState.artist,
        duration: musicState.duration,
        currentTime: musicState.currentTime,
        isPlaying: musicState.isPlaying,
        activeLyric:
          musicState.activeLyric,
      },
    });
  } catch (error) {
    console.error(
      "POST /api/iot/music error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Gagal memperbarui state musik.",
      },
      {
        status: 500,
      },
    );
  }
}