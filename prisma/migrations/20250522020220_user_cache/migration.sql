-- CreateTable
CREATE TABLE "user_cache" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "slackId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_cache_email_key" ON "user_cache"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_cache_slackId_key" ON "user_cache"("slackId");
