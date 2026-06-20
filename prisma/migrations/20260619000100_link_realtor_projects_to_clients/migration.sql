ALTER TABLE "Project"
ADD COLUMN "realtorClientId" TEXT;

CREATE INDEX "Project_realtorClientId_idx" ON "Project"("realtorClientId");

ALTER TABLE "Project"
ADD CONSTRAINT "Project_realtorClientId_fkey"
FOREIGN KEY ("realtorClientId") REFERENCES "RealtorClient"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
