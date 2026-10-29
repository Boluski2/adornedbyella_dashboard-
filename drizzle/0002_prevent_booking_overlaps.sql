CREATE EXTENSION IF NOT EXISTS btree_gist;

--> statement-breakpoint

ALTER TABLE "bookings"
ADD CONSTRAINT "bookings_no_active_overlap"
EXCLUDE USING gist (
  "owner_id" WITH =,
  tstzrange("starts_at", "ends_at", '[)') WITH &&
)
WHERE ("status" IN ('scheduled', 'confirmed'));