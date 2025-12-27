-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "isSample" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "SupportTicket" ADD COLUMN     "isSample" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "isSample" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isSample" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "marketing_blog_posts" ADD COLUMN     "isSample" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "demo_templates" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "templateData" JSONB NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "activatedAt" TIMESTAMP(3),

    CONSTRAINT "demo_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demo_sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "changes" JSONB NOT NULL DEFAULT '{}',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "visitCount" INTEGER NOT NULL DEFAULT 1,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "demo_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demo_analytics" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "featureName" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "demo_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "demo_templates_version_key" ON "demo_templates"("version");

-- CreateIndex
CREATE INDEX "demo_templates_isActive_idx" ON "demo_templates"("isActive");

-- CreateIndex
CREATE INDEX "demo_templates_version_idx" ON "demo_templates"("version");

-- CreateIndex
CREATE UNIQUE INDEX "demo_sessions_sessionToken_key" ON "demo_sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "demo_sessions_sessionToken_idx" ON "demo_sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "demo_sessions_expiresAt_idx" ON "demo_sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "demo_sessions_templateId_idx" ON "demo_sessions"("templateId");

-- CreateIndex
CREATE INDEX "demo_analytics_eventType_idx" ON "demo_analytics"("eventType");

-- CreateIndex
CREATE INDEX "demo_analytics_featureName_idx" ON "demo_analytics"("featureName");

-- CreateIndex
CREATE INDEX "demo_analytics_createdAt_idx" ON "demo_analytics"("createdAt");

-- AddForeignKey
ALTER TABLE "demo_sessions" ADD CONSTRAINT "demo_sessions_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "demo_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
