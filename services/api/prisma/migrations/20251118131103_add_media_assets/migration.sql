-- CreateTable
CREATE TABLE "MarketingContent" (
    "id" TEXT NOT NULL,
    "contentJson" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedBy" TEXT NOT NULL,
    "updatedByEmail" TEXT NOT NULL,
    "changeNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketingContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketingContentAuditLog" (
    "id" TEXT NOT NULL,
    "marketingContentId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changes" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "previousVersion" INTEGER,
    "newVersion" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketingContentAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "storageKey" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "altText" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "uploadedByEmail" TEXT NOT NULL,
    "tenantId" TEXT,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MarketingContent_isActive_version_idx" ON "MarketingContent"("isActive", "version");

-- CreateIndex
CREATE INDEX "MarketingContent_createdAt_idx" ON "MarketingContent"("createdAt");

-- CreateIndex
CREATE INDEX "MarketingContentAuditLog_marketingContentId_idx" ON "MarketingContentAuditLog"("marketingContentId");

-- CreateIndex
CREATE INDEX "MarketingContentAuditLog_createdAt_idx" ON "MarketingContentAuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "MediaAsset_category_idx" ON "MediaAsset"("category");

-- CreateIndex
CREATE INDEX "MediaAsset_uploadedBy_idx" ON "MediaAsset"("uploadedBy");

-- CreateIndex
CREATE INDEX "MediaAsset_tenantId_idx" ON "MediaAsset"("tenantId");

-- CreateIndex
CREATE INDEX "MediaAsset_createdAt_idx" ON "MediaAsset"("createdAt");

-- AddForeignKey
ALTER TABLE "MarketingContentAuditLog" ADD CONSTRAINT "MarketingContentAuditLog_marketingContentId_fkey" FOREIGN KEY ("marketingContentId") REFERENCES "MarketingContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
