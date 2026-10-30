CREATE TABLE "rateLimit" (
	"key" text PRIMARY KEY NOT NULL,
	"count" integer NOT NULL,
	"lastRequest" bigint NOT NULL
);
