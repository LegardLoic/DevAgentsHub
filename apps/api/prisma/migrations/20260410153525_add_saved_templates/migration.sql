-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "toolSlug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "inputJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Template_userId_updatedAt_idx" ON "Template"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "Template_toolSlug_updatedAt_idx" ON "Template"("toolSlug", "updatedAt");

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_toolSlug_fkey" FOREIGN KEY ("toolSlug") REFERENCES "Tool"("slug") ON DELETE CASCADE ON UPDATE CASCADE;
