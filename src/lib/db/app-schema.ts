
import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

import { user } from "./auth-schema";

export const clients = pgTable(
  "clients",
  {
    id: text("id").primaryKey(),

    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    notes: text("notes"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("clients_owner_id_idx").on(table.ownerId),

    index("clients_owner_name_idx").on(
      table.ownerId,
      table.name,
    ),

    unique("clients_owner_id_id_unique").on(
      table.ownerId,
      table.id,
    ),
  ],
);

export const services = pgTable(
  "services",
  {
    id: text("id").primaryKey(),

    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    name: text("name").notNull(),
    description: text("description"),

    durationMinutes: integer("duration_minutes").notNull(),

    priceKobo: integer("price_kobo").notNull(),

    isActive: boolean("is_active")
      .default(true)
      .notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("services_owner_id_idx").on(table.ownerId),

    unique("services_owner_id_id_unique").on(
      table.ownerId,
      table.id,
    ),

    check(
      "services_duration_positive",
      sql`${table.durationMinutes} > 0`,
    ),

    check(
      "services_price_nonnegative",
      sql`${table.priceKobo} >= 0`,
    ),
  ],
);

export const bookings = pgTable(
  "bookings",
  {
    id: text("id").primaryKey(),

    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    clientId: text("client_id").notNull(),

    serviceId: text("service_id").notNull(),

    startsAt: timestamp("starts_at", { withTimezone: true })
      .notNull(),

    endsAt: timestamp("ends_at", { withTimezone: true })
      .notNull(),

    priceKobo: integer("price_kobo").notNull(),

    status: text("status")
      .default("scheduled")
      .notNull(),

    notes: text("notes"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("bookings_owner_start_idx").on(
      table.ownerId,
      table.startsAt,
    ),

    index("bookings_client_id_idx").on(table.clientId),

    foreignKey({
      name: "bookings_client_owner_fk",
      columns: [table.ownerId, table.clientId],
      foreignColumns: [clients.ownerId, clients.id],
    }).onDelete("restrict"),

    foreignKey({
      name: "bookings_service_owner_fk",
      columns: [table.ownerId, table.serviceId],
      foreignColumns: [services.ownerId, services.id],
    }).onDelete("restrict"),

    check(
      "bookings_valid_time_range",
      sql`${table.endsAt} > ${table.startsAt}`,
    ),

    check(
      "bookings_price_nonnegative",
      sql`${table.priceKobo} >= 0`,
    ),

    check(
      "bookings_valid_status",
      sql`${table.status} IN (
        'scheduled',
        'confirmed',
        'completed',
        'cancelled',
        'no_show'
      )`,
    ),
  ],
);


export const businessProfiles = pgTable(
  "business_profiles",
  {
    id: text("id").primaryKey(),

    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" })
      .unique(),

    brandName: text("brand_name").notNull(),

    slogan: text("slogan"),

    websiteTitle: text("website_title"),

    description: text("description"),

    logoUrl: text("logo_url"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
);