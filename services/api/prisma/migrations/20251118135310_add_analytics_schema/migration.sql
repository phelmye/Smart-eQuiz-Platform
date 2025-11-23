-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventCategory" TEXT NOT NULL,
    "eventLabel" TEXT,
    "eventValue" DOUBLE PRECISION,
    "sessionId" TEXT,
    "userId" TEXT,
    "visitorId" TEXT,
    "pageUrl" TEXT NOT NULL,
    "pageTitle" TEXT,
    "referrer" TEXT,
    "userAgent" TEXT,
    "deviceType" TEXT,
    "browser" TEXT,
    "operatingSystem" TEXT,
    "screenResolution" TEXT,
    "country" TEXT,
    "city" TEXT,
    "ipAddress" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversion" (
    "id" TEXT NOT NULL,
    "conversionType" TEXT NOT NULL,
    "conversionValue" DOUBLE PRECISION,
    "userId" TEXT,
    "visitorId" TEXT,
    "sessionId" TEXT,
    "source" TEXT,
    "medium" TEXT,
    "campaign" TEXT,
    "funnelStep" INTEGER,
    "funnelStage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ABTest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "variantA" JSONB NOT NULL,
    "variantB" JSONB NOT NULL,
    "trafficSplitA" INTEGER NOT NULL DEFAULT 50,
    "trafficSplitB" INTEGER NOT NULL DEFAULT 50,
    "status" TEXT NOT NULL,
    "primaryGoal" TEXT NOT NULL,
    "totalVisitors" INTEGER NOT NULL DEFAULT 0,
    "visitorsA" INTEGER NOT NULL DEFAULT 0,
    "visitorsB" INTEGER NOT NULL DEFAULT 0,
    "conversionsA" INTEGER NOT NULL DEFAULT 0,
    "conversionsB" INTEGER NOT NULL DEFAULT 0,
    "confidenceLevel" DOUBLE PRECISION,
    "winner" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ABTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ABTestVariant" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "assigned" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "converted" BOOLEAN NOT NULL DEFAULT false,
    "convertedAt" TIMESTAMP(3),

    CONSTRAINT "ABTestVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsMetric" (
    "id" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "metricDate" TIMESTAMP(3) NOT NULL,
    "dimension1" TEXT,
    "dimension2" TEXT,
    "totalCount" INTEGER NOT NULL DEFAULT 0,
    "uniqueCount" INTEGER NOT NULL DEFAULT 0,
    "totalValue" DOUBLE PRECISION,
    "averageValue" DOUBLE PRECISION,
    "conversionRate" DOUBLE PRECISION,
    "bounceRate" DOUBLE PRECISION,
    "avgTimeOnPage" DOUBLE PRECISION,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalyticsMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnalyticsEvent_eventType_eventCategory_idx" ON "AnalyticsEvent"("eventType", "eventCategory");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_sessionId_idx" ON "AnalyticsEvent"("sessionId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_userId_idx" ON "AnalyticsEvent"("userId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_createdAt_idx" ON "AnalyticsEvent"("createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_pageUrl_idx" ON "AnalyticsEvent"("pageUrl");

-- CreateIndex
CREATE INDEX "Conversion_conversionType_idx" ON "Conversion"("conversionType");

-- CreateIndex
CREATE INDEX "Conversion_userId_idx" ON "Conversion"("userId");

-- CreateIndex
CREATE INDEX "Conversion_visitorId_idx" ON "Conversion"("visitorId");

-- CreateIndex
CREATE INDEX "Conversion_sessionId_idx" ON "Conversion"("sessionId");

-- CreateIndex
CREATE INDEX "Conversion_createdAt_idx" ON "Conversion"("createdAt");

-- CreateIndex
CREATE INDEX "Conversion_source_medium_idx" ON "Conversion"("source", "medium");

-- CreateIndex
CREATE INDEX "ABTest_status_idx" ON "ABTest"("status");

-- CreateIndex
CREATE INDEX "ABTest_createdAt_idx" ON "ABTest"("createdAt");

-- CreateIndex
CREATE INDEX "ABTestVariant_testId_variant_idx" ON "ABTestVariant"("testId", "variant");

-- CreateIndex
CREATE INDEX "ABTestVariant_visitorId_idx" ON "ABTestVariant"("visitorId");

-- CreateIndex
CREATE UNIQUE INDEX "ABTestVariant_testId_visitorId_key" ON "ABTestVariant"("testId", "visitorId");

-- CreateIndex
CREATE INDEX "AnalyticsMetric_metricType_metricDate_idx" ON "AnalyticsMetric"("metricType", "metricDate");

-- CreateIndex
CREATE INDEX "AnalyticsMetric_metricDate_idx" ON "AnalyticsMetric"("metricDate");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsMetric_metricType_metricDate_dimension1_dimension2_key" ON "AnalyticsMetric"("metricType", "metricDate", "dimension1", "dimension2");

-- AddForeignKey
ALTER TABLE "ABTestVariant" ADD CONSTRAINT "ABTestVariant_testId_fkey" FOREIGN KEY ("testId") REFERENCES "ABTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
