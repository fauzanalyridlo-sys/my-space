-- CreateTable
CREATE TABLE "Alarm" (
    "id" SERIAL NOT NULL,
    "time" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Alarm_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Alarm_userId_idx" ON "Alarm"("userId");

-- AddForeignKey
ALTER TABLE "Alarm" ADD CONSTRAINT "Alarm_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
