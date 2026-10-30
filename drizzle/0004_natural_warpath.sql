ALTER TABLE "rateLimit" DROP CONSTRAINT "rateLimit_pkey";
--> statement-breakpoint

ALTER TABLE "rateLimit" ADD COLUMN "id" text;
--> statement-breakpoint

UPDATE "rateLimit" SET "id" = gen_random_uuid()::text WHERE "id" IS NULL;
--> statement-breakpoint

ALTER TABLE "rateLimit" ALTER COLUMN "id" SET NOT NULL;
--> statement-breakpoint

ALTER TABLE "rateLimit" ADD CONSTRAINT "rateLimit_pkey" PRIMARY KEY ("id");
--> statement-breakpoint

ALTER TABLE "rateLimit" ADD CONSTRAINT "rateLimit_key_unique" UNIQUE ("key");
