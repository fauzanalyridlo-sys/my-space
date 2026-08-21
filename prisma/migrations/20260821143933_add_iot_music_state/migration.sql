-- CreateTable
CREATE TABLE "IotMusicState" (
    "id" SERIAL NOT NULL,
    "songId" TEXT,
    "title" TEXT,
    "artist" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "currentTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isPlaying" BOOLEAN NOT NULL DEFAULT false,
    "activeLyric" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deviceId" INTEGER NOT NULL,

    CONSTRAINT "IotMusicState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IotMusicState_deviceId_key" ON "IotMusicState"("deviceId");

-- AddForeignKey
ALTER TABLE "IotMusicState" ADD CONSTRAINT "IotMusicState_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "IotDevice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
