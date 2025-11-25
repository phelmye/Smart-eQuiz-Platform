-- CreateEnum
CREATE TYPE "LegalDocumentType" AS ENUM ('TERMS_OF_SERVICE', 'PRIVACY_POLICY', 'COOKIE_POLICY', 'ACCEPTABLE_USE_POLICY', 'DATA_PROCESSING_AGREEMENT', 'SERVICE_LEVEL_AGREEMENT');

-- CreateTable
CREATE TABLE "legal_documents" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" "LegalDocumentType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "requiresAcceptance" BOOLEAN NOT NULL DEFAULT true,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legal_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal_document_acceptances" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "documentVersion" INTEGER NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "legal_document_acceptances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "legal_documents_tenantId_type_isActive_idx" ON "legal_documents"("tenantId", "type", "isActive");

-- CreateIndex
CREATE INDEX "legal_documents_tenantId_type_effectiveDate_idx" ON "legal_documents"("tenantId", "type", "effectiveDate");

-- CreateIndex
CREATE UNIQUE INDEX "legal_documents_tenantId_type_version_key" ON "legal_documents"("tenantId", "type", "version");

-- CreateIndex
CREATE INDEX "legal_document_acceptances_userId_acceptedAt_idx" ON "legal_document_acceptances"("userId", "acceptedAt");

-- CreateIndex
CREATE INDEX "legal_document_acceptances_documentId_acceptedAt_idx" ON "legal_document_acceptances"("documentId", "acceptedAt");

-- CreateIndex
CREATE UNIQUE INDEX "legal_document_acceptances_userId_documentId_key" ON "legal_document_acceptances"("userId", "documentId");

-- AddForeignKey
ALTER TABLE "legal_documents" ADD CONSTRAINT "legal_documents_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legal_document_acceptances" ADD CONSTRAINT "legal_document_acceptances_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legal_document_acceptances" ADD CONSTRAINT "legal_document_acceptances_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "legal_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
