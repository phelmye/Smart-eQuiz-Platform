-- CreateEnum
CREATE TYPE "LandingPageSection" AS ENUM ('HERO', 'STATS', 'FEATURES', 'TESTIMONIALS', 'BRANDING');

-- CreateTable
CREATE TABLE "landing_page_contents" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "section" "LandingPageSection" NOT NULL,
    "content" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landing_page_contents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "landing_page_contents_tenantId_section_isActive_idx" ON "landing_page_contents"("tenantId", "section", "isActive");

-- CreateIndex
CREATE INDEX "landing_page_contents_tenantId_section_effectiveDate_idx" ON "landing_page_contents"("tenantId", "section", "effectiveDate");

-- CreateIndex
CREATE UNIQUE INDEX "landing_page_contents_tenantId_section_version_key" ON "landing_page_contents"("tenantId", "section", "version");

-- AddForeignKey
ALTER TABLE "landing_page_contents" ADD CONSTRAINT "landing_page_contents_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
