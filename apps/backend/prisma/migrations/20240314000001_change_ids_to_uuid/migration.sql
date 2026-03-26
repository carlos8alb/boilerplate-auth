-- Change IDs from auto-increment to UUID
-- Add new UUID columns
ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "id_new" UUID;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "id_new" UUID;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "roleId_new" UUID;
ALTER TABLE "refresh_tokens" ADD COLUMN IF NOT EXISTS "id_new" UUID;
ALTER TABLE "refresh_tokens" ADD COLUMN IF NOT EXISTS "userId_new" UUID;

-- Generate UUIDs for existing records
UPDATE "roles" SET "id_new" = gen_random_uuid() WHERE "id_new" IS NULL;
UPDATE "users" SET "id_new" = gen_random_uuid() WHERE "id_new" IS NULL;
UPDATE "refresh_tokens" SET "id_new" = gen_random_uuid() WHERE "id_new" IS NULL;

-- Map roleId to UUID
UPDATE "users" SET "roleId_new" = (
  SELECT "id_new" FROM "roles" WHERE "roles"."id" = "users"."roleId"
);

-- Map userId to UUID  
UPDATE "refresh_tokens" SET "userId_new" = (
  SELECT "id_new" FROM "users" WHERE "users"."id" = "refresh_tokens"."userId"
);

-- Drop foreign keys
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_roleId_fkey";
ALTER TABLE "refresh_tokens" DROP CONSTRAINT IF EXISTS "refresh_tokens_userId_fkey";

-- Drop old columns and rename new ones
ALTER TABLE "roles" DROP COLUMN IF EXISTS "id";
ALTER TABLE "roles" RENAME COLUMN "id_new" TO "id";

ALTER TABLE "users" DROP COLUMN IF EXISTS "id";
ALTER TABLE "users" RENAME COLUMN "id_new" TO "id";
ALTER TABLE "users" DROP COLUMN IF EXISTS "roleId";
ALTER TABLE "users" RENAME COLUMN "roleId_new" TO "roleId";

ALTER TABLE "refresh_tokens" DROP COLUMN IF EXISTS "id";
ALTER TABLE "refresh_tokens" RENAME COLUMN "id_new" TO "id";
ALTER TABLE "refresh_tokens" DROP COLUMN IF EXISTS "userId";
ALTER TABLE "refresh_tokens" RENAME COLUMN "userId_new" TO "userId";

-- Add primary keys
ALTER TABLE "roles" ADD PRIMARY KEY ("id");
ALTER TABLE "users" ADD PRIMARY KEY ("id");
ALTER TABLE "refresh_tokens" ADD PRIMARY KEY ("id");

-- Add foreign keys
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" 
  FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
