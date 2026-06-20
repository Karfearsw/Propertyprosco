CREATE TYPE "SubscriptionStatus_new" AS ENUM (
  'CHECKOUT_PENDING',
  'ACTIVE',
  'PAST_DUE',
  'CANCELED',
  'INCOMPLETE'
);

ALTER TABLE "ProProfile"
  ALTER COLUMN "subscriptionStatus" DROP DEFAULT,
  ADD COLUMN "subscriptionStatus_new" "SubscriptionStatus_new";

UPDATE "ProProfile"
SET "subscriptionStatus_new" = CASE "subscriptionStatus"
  WHEN 'TRIAL'::"SubscriptionStatus" THEN 'CHECKOUT_PENDING'::"SubscriptionStatus_new"
  WHEN 'TRIAL_EXPIRED'::"SubscriptionStatus" THEN 'CHECKOUT_PENDING'::"SubscriptionStatus_new"
  WHEN 'CHECKOUT_PENDING'::"SubscriptionStatus" THEN 'CHECKOUT_PENDING'::"SubscriptionStatus_new"
  WHEN 'ACTIVE'::"SubscriptionStatus" THEN 'ACTIVE'::"SubscriptionStatus_new"
  WHEN 'PAST_DUE'::"SubscriptionStatus" THEN 'PAST_DUE'::"SubscriptionStatus_new"
  WHEN 'CANCELED'::"SubscriptionStatus" THEN 'CANCELED'::"SubscriptionStatus_new"
  WHEN 'INCOMPLETE'::"SubscriptionStatus" THEN 'INCOMPLETE'::"SubscriptionStatus_new"
END;

ALTER TABLE "ProProfile"
  DROP COLUMN "subscriptionStatus",
  RENAME COLUMN "subscriptionStatus_new" TO "subscriptionStatus",
  ALTER COLUMN "subscriptionStatus" SET NOT NULL,
  ALTER COLUMN "subscriptionStatus" SET DEFAULT 'CHECKOUT_PENDING'::"SubscriptionStatus_new",
  DROP COLUMN IF EXISTS "trialStartedAt",
  DROP COLUMN IF EXISTS "trialEndsAt";

ALTER TABLE "RealtorProfile"
  ALTER COLUMN "subscriptionStatus" DROP DEFAULT,
  ADD COLUMN "subscriptionStatus_new" "SubscriptionStatus_new";

UPDATE "RealtorProfile"
SET "subscriptionStatus_new" = CASE "subscriptionStatus"
  WHEN 'TRIAL'::"SubscriptionStatus" THEN 'CHECKOUT_PENDING'::"SubscriptionStatus_new"
  WHEN 'TRIAL_EXPIRED'::"SubscriptionStatus" THEN 'CHECKOUT_PENDING'::"SubscriptionStatus_new"
  WHEN 'CHECKOUT_PENDING'::"SubscriptionStatus" THEN 'CHECKOUT_PENDING'::"SubscriptionStatus_new"
  WHEN 'ACTIVE'::"SubscriptionStatus" THEN 'ACTIVE'::"SubscriptionStatus_new"
  WHEN 'PAST_DUE'::"SubscriptionStatus" THEN 'PAST_DUE'::"SubscriptionStatus_new"
  WHEN 'CANCELED'::"SubscriptionStatus" THEN 'CANCELED'::"SubscriptionStatus_new"
  WHEN 'INCOMPLETE'::"SubscriptionStatus" THEN 'INCOMPLETE'::"SubscriptionStatus_new"
END;

ALTER TABLE "RealtorProfile"
  DROP COLUMN "subscriptionStatus",
  RENAME COLUMN "subscriptionStatus_new" TO "subscriptionStatus",
  ALTER COLUMN "subscriptionStatus" SET NOT NULL,
  ALTER COLUMN "subscriptionStatus" SET DEFAULT 'CHECKOUT_PENDING'::"SubscriptionStatus_new",
  DROP COLUMN IF EXISTS "trialStartedAt",
  DROP COLUMN IF EXISTS "trialEndsAt";

DROP TYPE "SubscriptionStatus";
ALTER TYPE "SubscriptionStatus_new" RENAME TO "SubscriptionStatus";
