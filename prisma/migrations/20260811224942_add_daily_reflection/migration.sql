-- CreateTable
CREATE TABLE "DailyReflection" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "howWasYourDay" TEXT NOT NULL,
    "whatDidYouLearn" TEXT NOT NULL,
    "tomorrow" TEXT NOT NULL,
    "letGo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyReflection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyReflection_date_key" ON "DailyReflection"("date");
