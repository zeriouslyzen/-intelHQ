-- CreateTable ChatProfile
CREATE TABLE "ChatProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'online',
    "awayMessage" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable ThreadParticipant
CREATE TABLE "ThreadParticipant" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ThreadParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable BuddyList
CREATE TABLE "BuddyList" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "buddyUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BuddyList_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChatProfile_userId_key" ON "ChatProfile"("userId");
CREATE UNIQUE INDEX "ThreadParticipant_threadId_userId_key" ON "ThreadParticipant"("threadId", "userId");
CREATE UNIQUE INDEX "BuddyList_userId_buddyUserId_key" ON "BuddyList"("userId", "buddyUserId");

-- AddForeignKey
ALTER TABLE "ChatProfile" ADD CONSTRAINT "ChatProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ThreadParticipant" ADD CONSTRAINT "ThreadParticipant_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ThreadParticipant" ADD CONSTRAINT "ThreadParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BuddyList" ADD CONSTRAINT "BuddyList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BuddyList" ADD CONSTRAINT "BuddyList_buddyUserId_fkey" FOREIGN KEY ("buddyUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
