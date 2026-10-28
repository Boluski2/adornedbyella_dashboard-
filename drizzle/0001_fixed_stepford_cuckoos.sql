
ALTER TABLE "bookings"
DROP CONSTRAINT "bookings_valid_status";
--> statement-breakpoint

ALTER TABLE "bookings"
DROP CONSTRAINT "bookings_client_id_clients_id_fk";
--> statement-breakpoint

ALTER TABLE "bookings"
DROP CONSTRAINT "bookings_service_id_services_id_fk";
--> statement-breakpoint

-- Add the referenced unique constraints before creating composite foreign keys.
ALTER TABLE "clients"
ADD CONSTRAINT "clients_owner_id_id_unique"
UNIQUE ("owner_id", "id");
--> statement-breakpoint

ALTER TABLE "services"
ADD CONSTRAINT "services_owner_id_id_unique"
UNIQUE ("owner_id", "id");
--> statement-breakpoint

-- Ensure each booking references a client belonging to the same owner.
ALTER TABLE "bookings"
ADD CONSTRAINT "bookings_client_owner_fk"
FOREIGN KEY ("owner_id", "client_id")
REFERENCES "public"."clients" ("owner_id", "id")
ON DELETE RESTRICT ON UPDATE NO ACTION;
--> statement-breakpoint

-- Ensure each booking references a service belonging to the same owner.
ALTER TABLE "bookings"
ADD CONSTRAINT "bookings_service_owner_fk"
FOREIGN KEY ("owner_id", "service_id")
REFERENCES "public"."services" ("owner_id", "id")
ON DELETE RESTRICT ON UPDATE NO ACTION;
--> statement-breakpoint

ALTER TABLE "bookings"
ADD CONSTRAINT "bookings_valid_status"
CHECK (
  "status" IN (
    'scheduled',
    'confirmed',
    'completed',
    'cancelled',
    'no_show'
  )
);
