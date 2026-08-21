import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  auth,
} from "@/auth";

import {
  prisma,
} from "@/lib/prisma";

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
// Header:
//
// x-iot-token: DEVICE_TOKEN
// ======================================================

export async function GET(
  request: NextRequest,
) {
  try {

    console.log(
      "========================================",
    );

    console.log(
      "GET /api/iot/music",
    );

    // ==================================================
    // AMBIL TOKEN
    // ==================================================

    const token =
      request.headers.get(
        "x-iot-token",
      );

    console.log(
      "IoT GET token received:",
      token
        ? `${token.substring(0, 8)}...`
        : "MISSING",
    );

    if (
      !token
    ) {
      console.log(
        "IoT GET ERROR: Missing token",
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Missing IoT token.",
        },
        {
          status: 401,
        },
      );
    }

    // ==================================================
    // CARI DEVICE BERDASARKAN TOKEN
    // ==================================================

    const device =
      await prisma.iotDevice.findUnique({
        where: {
          deviceToken:
            token,
        },

        select: {
          id: true,
          name: true,
          enabled: true,
          userId: true,
          deviceToken: true,
        },
      });

    // ==================================================
    // DEVICE TIDAK DITEMUKAN
    // ==================================================

    if (
      !device
    ) {
      console.log(
        "IoT GET ERROR: Invalid token",
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid IoT token.",
        },
        {
          status: 401,
        },
      );
    }

    // ==================================================
    // DEBUG DEVICE
    // ==================================================

    console.log(
      "IoT GET device found:",
      {
        deviceId:
          device.id,

        deviceName:
          device.name,

        userId:
          device.userId,

        enabled:
          device.enabled,

        deviceToken:
          device.deviceToken,
      },
    );

    // ==================================================
    // DEVICE DISABLED
    // ==================================================

    if (
      !device.enabled
    ) {
      console.log(
        "IoT GET ERROR: Device disabled",
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "IoT device is disabled.",
        },
        {
          status: 403,
        },
      );
    }

    // ==================================================
    // AMBIL MUSIC STATE BERDASARKAN DEVICE ID
    // ==================================================

    const musicState =
      await prisma.iotMusicState.findUnique({
        where: {
          deviceId:
            device.id,
        },
      });

    // ==================================================
    // DEBUG MUSIC STATE
    // ==================================================

    console.log(
      "IoT GET music state:",
      {
        deviceId:
          device.id,

        exists:
          Boolean(
            musicState,
          ),

        musicState,
      },
    );

    // ==================================================
    // BELUM ADA STATE
    // ==================================================

    if (
      !musicState
    ) {
      console.log(
        "IoT GET: No music state for deviceId:",
        device.id,
      );

      return NextResponse.json({
        success: true,
        music:
          EMPTY_MUSIC_STATE,
      });
    }

    // ==================================================
    // RESPONSE ESP32
    // ==================================================

    const response: MusicStateResponse = {
      songId:
        musicState.songId,

      title:
        musicState.title,

      artist:
        musicState.artist,

      duration:
        musicState.duration,

      currentTime:
        musicState.currentTime,

      isPlaying:
        musicState.isPlaying,

      activeLyric:
        musicState.activeLyric,
    };

    console.log(
      "IoT GET SUCCESS:",
      {
        deviceId:
          device.id,

        songId:
          response.songId,

        title:
          response.title,

        currentTime:
          response.currentTime,

        isPlaying:
          response.isPlaying,
      },
    );

    console.log(
      "========================================",
    );

    return NextResponse.json({
      success: true,
      music:
        response,
    });

  } catch (
    error
  ) {

    console.error(
      "GET /api/iot/music ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Gagal mengambil state musik.",
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
// User harus login.
//
// Music state disimpan ke IotDevice
// milik user yang sedang login.
// ======================================================

export async function POST(
  request: NextRequest,
) {
  try {

    console.log(
      "========================================",
    );

    console.log(
      "POST /api/iot/music",
    );

    // ==================================================
    // CEK SESSION
    // ==================================================

    const session =
      await auth();

    console.log(
      "IoT POST session:",
      {
        userId:
          session?.user?.id ??
          null,

        email:
          session?.user?.email ??
          null,
      },
    );

    if (
      !session?.user?.id
    ) {
      console.log(
        "IoT POST ERROR: Unauthorized",
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    // ==================================================
    // USER ID
    // ==================================================

    const userId =
      Number(
        session.user.id,
      );

    if (
      !Number.isInteger(
        userId,
      ) ||
      userId <= 0
    ) {
      console.log(
        "IoT POST ERROR: Invalid user ID",
        {
          rawUserId:
            session.user.id,
        },
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid user session.",
        },
        {
          status: 401,
        },
      );
    }

    // ==================================================
    // PARSE BODY
    // ==================================================

    const body =
      await request.json();

    console.log(
      "IoT POST body:",
      body,
    );

    // ==================================================
    // MUSIC DATA
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
      console.log(
        "IoT POST ERROR: Invalid duration",
        duration,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid duration.",
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
      console.log(
        "IoT POST ERROR: Invalid currentTime",
        currentTime,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid currentTime.",
        },
        {
          status: 400,
        },
      );
    }

    // ==================================================
    // CARI DEVICE MILIK USER
    // ==================================================

    const devices =
      await prisma.iotDevice.findMany({
        where: {
          userId,
        },

        orderBy: {
          id: "asc",
        },

        select: {
          id: true,
          name: true,
          enabled: true,
          userId: true,
          deviceToken: true,
        },
      });

    // ==================================================
    // DEBUG SEMUA DEVICE USER
    // ==================================================

    console.log(
      "IoT POST user devices:",
      devices.map(
        (
          device
        ) => ({
          id:
            device.id,

          name:
            device.name,

          enabled:
            device.enabled,

          userId:
            device.userId,

          deviceToken:
            device.deviceToken,
        }),
      ),
    );

    // ==================================================
    // CARI DEVICE AKTIF
    // ==================================================

    const device =
      devices.find(
        (
          item
        ) =>
          item.enabled,
      );

    // ==================================================
    // DEVICE TIDAK ADA
    // ==================================================

    if (
      !device
    ) {
      console.log(
        "IoT POST ERROR: No active device",
        {
          userId,
          totalDevices:
            devices.length,
        },
      );

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
    // DEBUG DEVICE YANG DIPILIH
    // ==================================================

    console.log(
      "IoT POST selected device:",
      {
        deviceId:
          device.id,

        deviceName:
          device.name,

        userId:
          device.userId,

        enabled:
          device.enabled,

        deviceToken:
          device.deviceToken,
      },
    );

    // ==================================================
    // UPSERT MUSIC STATE
    // ==================================================

    const musicState =
      await prisma.iotMusicState.upsert({
        where: {
          deviceId:
            device.id,
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
          deviceId:
            device.id,

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
    // DEBUG DATA TERSIMPAN
    // ==================================================

    console.log(
      "IoT POST MUSIC SAVED:",
      {
        musicStateId:
          musicState.id,

        deviceId:
          musicState.deviceId,

        songId:
          musicState.songId,

        title:
          musicState.title,

        artist:
          musicState.artist,

        duration:
          musicState.duration,

        currentTime:
          musicState.currentTime,

        isPlaying:
          musicState.isPlaying,

        activeLyric:
          musicState.activeLyric,

        updatedAt:
          musicState.updatedAt,
      },
    );

    console.log(
      "========================================",
    );

    // ==================================================
    // RESPONSE
    // ==================================================

    return NextResponse.json({
      success: true,

      music: {
        songId:
          musicState.songId,

        title:
          musicState.title,

        artist:
          musicState.artist,

        duration:
          musicState.duration,

        currentTime:
          musicState.currentTime,

        isPlaying:
          musicState.isPlaying,

        activeLyric:
          musicState.activeLyric,
      },

      // DEBUG
      debug: {
        userId,
        deviceId:
          device.id,
        deviceName:
          device.name,
      },
    });

  } catch (
    error
  ) {

    console.error(
      "POST /api/iot/music ERROR:",
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