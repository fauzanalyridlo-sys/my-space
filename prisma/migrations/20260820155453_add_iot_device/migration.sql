-- CreateTable
CREATE TABLE "IotDevice" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "deviceToken" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "IotDevice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IotDevice_deviceToken_key" ON "IotDevice"("deviceToken");

-- AddForeignKey
ALTER TABLE "IotDevice" ADD CONSTRAINT "IotDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
