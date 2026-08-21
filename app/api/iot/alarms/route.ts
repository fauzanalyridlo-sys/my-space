import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("x-iot-token");

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing IoT token.",
        },
        { status: 401 },
      );
    }

    const device = await prisma.iotDevice.findFirst({
      where: {
        deviceToken: token,
        enabled: true,
      },
    });

    if (!device) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid IoT token.",
        },
        { status: 401 },
      );
    }

    const alarms = await prisma.alarm.findMany({
      where: {
        userId: device.userId,
      },
      orderBy: {
        time: "asc",
      },
      select: {
        id: true,
        time: true,
        label: true,
        enabled: true,
      },
    });

    return NextResponse.json({
      success: true,
      alarms,
    });
  } catch (error) {
    console.error("GET /api/iot/alarms error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Gagal mengambil data alarm.",
      },
      { status: 500 },
    );
  }
}
