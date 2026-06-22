-- Drop homeowner subscription columns introduced by 20260621093000_add_homeowner_plus_billing
DROP INDEX IF EXISTS "User_homeownerStripeSubscriptionId_key";

ALTER TABLE "User"
DROP COLUMN IF EXISTS "homeownerSubscriptionStatus",
DROP COLUMN IF EXISTS "homeownerBillingActivatedAt",
DROP COLUMN IF EXISTS "homeownerSubscriptionCurrentPeriodEnd",
DROP COLUMN IF EXISTS "homeownerSubscriptionCanceledAt",
DROP COLUMN IF EXISTS "homeownerStripeSubscriptionId",
DROP COLUMN IF EXISTS "homeownerStripePriceId",
DROP COLUMN IF EXISTS "homeownerStripeProductId";

ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "homeownerStripeDefaultPaymentMethodId" TEXT,
ADD COLUMN IF NOT EXISTS "homeownerStripePaymentMethodAddedAt" TIMESTAMP(3);

DO $$ BEGIN
  CREATE TYPE "ProjectPaymentStatus" AS ENUM ('REQUIRES_ACTION', 'SUCCEEDED', 'FAILED', 'CANCELED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "ProjectPayment" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "homeownerId" TEXT NOT NULL,
  "proId" TEXT,
  "jobAmountCents" INTEGER NOT NULL,
  "platformFeeCents" INTEGER NOT NULL,
  "totalAmountCents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'usd',
  "status" "ProjectPaymentStatus" NOT NULL DEFAULT 'REQUIRES_ACTION',
  "stripePaymentIntentId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ProjectPayment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ProjectPayment_projectId_key" ON "ProjectPayment"("projectId");
CREATE UNIQUE INDEX IF NOT EXISTS "ProjectPayment_stripePaymentIntentId_key" ON "ProjectPayment"("stripePaymentIntentId");

ALTER TABLE "ProjectPayment"
ADD CONSTRAINT "ProjectPayment_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectPayment"
ADD CONSTRAINT "ProjectPayment_homeownerId_fkey"
FOREIGN KEY ("homeownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectPayment"
ADD CONSTRAINT "ProjectPayment_proId_fkey"
FOREIGN KEY ("proId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
