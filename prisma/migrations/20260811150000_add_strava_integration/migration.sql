-- CreateTable
CREATE TABLE "StravaIntegration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "athleteId" INTEGER NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "scope" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StravaIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StravaIntegration_userId_key" ON "StravaIntegration"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StravaIntegration_athleteId_key" ON "StravaIntegration"("athleteId");

-- AddForeignKey
ALTER TABLE "StravaIntegration" ADD CONSTRAINT "StravaIntegration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE cascade ON UPDATE cascade;

-- AddColumn
ALTER TABLE "Activity" ADD COLUMN "stravaId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Activity_stravaId_key" ON "Activity"("stravaId");
