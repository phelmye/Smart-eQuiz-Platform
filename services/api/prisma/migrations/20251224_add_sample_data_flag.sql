-- Add isSample flag to tables that can have demo data
-- This allows us to seed the database with sample data and clear it easily

-- Add to Tenant table
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "isSample" BOOLEAN DEFAULT false;

-- Add to SupportTicket table
ALTER TABLE "SupportTicket" ADD COLUMN IF NOT EXISTS "isSample" BOOLEAN DEFAULT false;

-- Add to User table (for demo users)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isSample" BOOLEAN DEFAULT false;

-- Add to AuditLog table
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "isSample" BOOLEAN DEFAULT false;

-- Add to MarketingBlogPost (already has sample posts)
ALTER TABLE "MarketingBlogPost" ADD COLUMN IF NOT EXISTS "isSample" BOOLEAN DEFAULT false;

-- Create index for efficient sample data queries
CREATE INDEX IF NOT EXISTS "Tenant_isSample_idx" ON "Tenant"("isSample");
CREATE INDEX IF NOT EXISTS "SupportTicket_isSample_idx" ON "SupportTicket"("isSample");
CREATE INDEX IF NOT EXISTS "User_isSample_idx" ON "User"("isSample");
CREATE INDEX IF NOT EXISTS "AuditLog_isSample_idx" ON "AuditLog"("isSample");

-- Comments
COMMENT ON COLUMN "Tenant"."isSample" IS 'Flag to indicate this is sample/demo data that can be cleared';
COMMENT ON COLUMN "SupportTicket"."isSample" IS 'Flag to indicate this is sample/demo data that can be cleared';
COMMENT ON COLUMN "User"."isSample" IS 'Flag to indicate this is sample/demo user that can be cleared';
COMMENT ON COLUMN "AuditLog"."isSample" IS 'Flag to indicate this is sample/demo log that can be cleared';
