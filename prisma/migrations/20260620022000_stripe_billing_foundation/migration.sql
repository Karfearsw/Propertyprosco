DO $$
BEGIN
  CREATE TYPE "SubscriptionStatus" AS ENUM (
    'TRIAL',
    'TRIAL_EXPIRED',
    'CHECKOUT_PENDING',
    'ACTIVE',
    'PAST_DUE',
    'CANCELED',
    'INCOMPLETE'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "ProProfile"
  ADD COLUMN IF NOT EXISTS "trialStartedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "billingActivatedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "subscriptionCurrentPeriodEnd" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "subscriptionCanceledAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT,
  ADD COLUMN IF NOT EXISTS "stripePriceId" TEXT,
  ADD COLUMN IF NOT EXISTS "stripeProductId" TEXT;

ALTER TABLE "RealtorProfile"
  ADD COLUMN IF NOT EXISTS "trialStartedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "billingActivatedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "subscriptionCurrentPeriodEnd" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "subscriptionCanceledAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT,
  ADD COLUMN IF NOT EXISTS "stripePriceId" TEXT,
  ADD COLUMN IF NOT EXISTS "stripeProductId" TEXT;

UPDATE "ProProfile"
SET
  "trialStartedAt" = COALESCE("trialStartedAt", "createdAt"),
  "billingActivatedAt" = CASE
    WHEN LOWER(COALESCE("subscriptionStatus", 'trial')) = 'active'
      THEN COALESCE("billingActivatedAt", "createdAt")
    ELSE "billingActivatedAt"
  END;

UPDATE "RealtorProfile"
SET
  "trialStartedAt" = COALESCE("trialStartedAt", "createdAt"),
  "billingActivatedAt" = CASE
    WHEN LOWER(COALESCE("subscriptionStatus", 'trial')) = 'active'
      THEN COALESCE("billingActivatedAt", "createdAt")
    ELSE "billingActivatedAt"
  END;

ALTER TABLE "ProProfile" ADD COLUMN IF NOT EXISTS "subscriptionStatus_new" "SubscriptionStatus";

UPDATE "ProProfile"
SET "subscriptionStatus_new" = CASE LOWER(COALESCE("subscriptionStatus", 'trial'))
  WHEN 'trial' THEN 'TRIAL'::"SubscriptionStatus"
  WHEN 'trial_expired' THEN 'TRIAL_EXPIRED'::"SubscriptionStatus"
  WHEN 'checkout_pending' THEN 'CHECKOUT_PENDING'::"SubscriptionStatus"
  WHEN 'active' THEN 'ACTIVE'::"SubscriptionStatus"
  WHEN 'past_due' THEN 'PAST_DUE'::"SubscriptionStatus"
  WHEN 'canceled' THEN 'CANCELED'::"SubscriptionStatus"
  WHEN 'incomplete' THEN 'INCOMPLETE'::"SubscriptionStatus"
  ELSE 'TRIAL'::"SubscriptionStatus"
END;

ALTER TABLE "RealtorProfile" ADD COLUMN IF NOT EXISTS "subscriptionStatus_new" "SubscriptionStatus";

UPDATE "RealtorProfile"
SET "subscriptionStatus_new" = CASE LOWER(COALESCE("subscriptionStatus", 'trial'))
  WHEN 'trial' THEN 'TRIAL'::"SubscriptionStatus"
  WHEN 'trial_expired' THEN 'TRIAL_EXPIRED'::"SubscriptionStatus"
  WHEN 'checkout_pending' THEN 'CHECKOUT_PENDING'::"SubscriptionStatus"
  WHEN 'active' THEN 'ACTIVE'::"SubscriptionStatus"
  WHEN 'past_due' THEN 'PAST_DUE'::"SubscriptionStatus"
  WHEN 'canceled' THEN 'CANCELED'::"SubscriptionStatus"
  WHEN 'incomplete' THEN 'INCOMPLETE'::"SubscriptionStatus"
  ELSE 'TRIAL'::"SubscriptionStatus"
END;

ALTER TABLE "ProProfile" DROP COLUMN "subscriptionStatus";
ALTER TABLE "ProProfile" RENAME COLUMN "subscriptionStatus_new" TO "subscriptionStatus";
ALTER TABLE "ProProfile" ALTER COLUMN "subscriptionStatus" SET DEFAULT 'TRIAL';
ALTER TABLE "ProProfile" ALTER COLUMN "subscriptionStatus" SET NOT NULL;

ALTER TABLE "RealtorProfile" DROP COLUMN "subscriptionStatus";
ALTER TABLE "RealtorProfile" RENAME COLUMN "subscriptionStatus_new" TO "subscriptionStatus";
ALTER TABLE "RealtorProfile" ALTER COLUMN "subscriptionStatus" SET DEFAULT 'TRIAL';
ALTER TABLE "RealtorProfile" ALTER COLUMN "subscriptionStatus" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "ProProfile_stripeSubscriptionId_key" ON "ProProfile"("stripeSubscriptionId");
CREATE UNIQUE INDEX IF NOT EXISTS "RealtorProfile_stripeSubscriptionId_key" ON "RealtorProfile"("stripeSubscriptionId");
