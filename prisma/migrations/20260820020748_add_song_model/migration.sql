-- CreateTable
CREATE TABLE "Song" (
    "id" SERIAL NOT NULL,
    "songId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT,
    "audioUrl" TEXT NOT NULL,
    "lyricsUrl" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Song_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Song_songId_key" ON "Song"("songId");

-- AddForeignKey
ALTER TABLE "Song" ADD CONSTRAINT "Song_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
