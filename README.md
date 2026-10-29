# AdornedByElla

AdornedByElla is a beauty-business management app branded in the interface as **GlamTrack**. It is built for beauty professionals to manage client information, appointments, and services.

The app includes account registration and sign-in, an authenticated dashboard, and database-backed client, service, and booking pages. Client and service records are scoped to the signed-in account. Dashboard summary figures and appointment rows are still sample data.

## Features

- Email and password registration, sign-in, and sign-out with Better Auth.
- Server-side session checks for protected pages and owner-scoped database queries.
- Create, search, edit, and delete client records.
- Create and view beauty services, including duration and price.
- Schedule bookings using an existing client and service; booking duration and price are taken from the selected service.
- Reject booking times that overlap an existing non-cancelled appointment for the same account.
- View recent bookings, cancel eligible bookings, and update booking status through allowed transitions.
- PostgreSQL persistence through Neon and Drizzle ORM.
- Drizzle SQL migrations for authentication and application tables.
- A database health endpoint at `GET /api/health`.
- Unit and integration test configurations using Vitest.

## Tech stack

- Next.js 16 App Router and React 19
- TypeScript
- Tailwind CSS 4
- Better Auth
- Neon Serverless Postgres
- Drizzle ORM and Drizzle Kit
- Vitest

## Requirements

- Node.js and npm
- A PostgreSQL database. A Neon database works with the configured serverless driver.

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env.local` file in the project root, next to `package.json`:

   ```dotenv
   DATABASE_URL=your_postgres_connection_string
   BETTER_AUTH_SECRET=replace_with_a_long_random_secret
   BETTER_AUTH_URL=http://localhost:3000
   ```

   `DATABASE_URL` should be the connection string for your application database. Generate a strong secret for `BETTER_AUTH_SECRET`; keep all real credentials private. `.env.local` is ignored by Git. Do not put secrets in `public/` or commit them.

3. Apply the checked-in database migrations:

   ```bash
   npx drizzle-kit migrate
   ```

   Drizzle reads `DATABASE_URL` from the root `.env.local` through `drizzle.config.ts`. The migrations create the Better Auth tables and the application tables (`clients`, `services`, and `bookings`).

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000). Create an account at `/sign-up`; after registration, the app redirects to the authenticated dashboard. Existing users can sign in at `/sign-in`.

## Environment variables

| Variable | Required for | Description |
| --- | --- | --- |
| `DATABASE_URL` | App, migrations, health check | PostgreSQL connection string for the main application database. |
| `BETTER_AUTH_SECRET` | App authentication | Private, strong secret used by Better Auth. |
| `BETTER_AUTH_URL` | App authentication | Base URL of the app, for example `http://localhost:3000` in development. |
| `DATABASE_URL_TEST` | Integration tests | Connection string for a separate, isolated test database. It must not point to the main database. |

The integration setup checks that `DATABASE_URL` and `DATABASE_URL_TEST` are both set and different before running. It switches the test process to the test database and checks that the expected tables exist. Prepare the test database with the project migrations before running integration tests.

## Database and migrations

Drizzle configuration is in `drizzle.config.ts`; schema definitions are in `src/lib/db/*-schema.ts`, and generated SQL migrations are in `drizzle/`.

Apply pending migrations:

```bash
npx drizzle-kit migrate
```

After changing a schema, generate a migration and apply it:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

The database includes Better Auth's `user`, `session`, `account`, and `verification` tables, along with application `clients`, `services`, and `bookings` tables. Application records are associated with their owner account. Booking constraints validate time ranges, status values, and nonnegative prices.

For local development, always verify that the `DATABASE_URL` selected for a migration points to the intended database before running the command.

## Routes

| Route | Purpose | Access |
| --- | --- | --- |
| `/` | Dashboard with overview metrics and upcoming appointment preview. The displayed records are sample data. | Signed-in users; unauthenticated requests redirect to `/sign-in`. |
| `/clients` | Search, add, view, edit, and delete the signed-in user's client records. | Signed-in users. |
| `/services` | Add a service and view the signed-in user's service menu. | Signed-in users. |
| `/bookings` | Schedule an appointment, view up to 20 recent bookings, cancel eligible bookings, and update status. | Signed-in users. |
| `/sign-up` | Create an account with a name, email, and password. | Public. |
| `/sign-in` | Sign in with email and password. | Public. |
| `GET /api/health` | Runs a database query and reports connection status. Returns HTTP 503 if the database check fails. | Public. |
| `/api/auth/[...all]` | Better Auth API handler for authentication requests. | Public endpoint; Better Auth enforces authentication for protected operations. |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server. |
| `npm run build` | Create a production build. |
| `npm run start` | Start the production server after building. |
| `npm run lint` | Run ESLint. |
| `npm test` | Run unit tests once. |
| `npm run test:watch` | Run unit tests in watch mode. |
| `npm run test:integration` | Run integration tests against `DATABASE_URL_TEST`. |
| `node check-test-database.mjs` | Print the table names found in the configured test database. |

Run unit tests and lint with:

```bash
npm test
npm run lint
```

Integration tests create and authenticate a test user in the isolated test database, then remove that user and its related authentication rows. They require `DATABASE_URL_TEST`, `DATABASE_URL`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, and an already-migrated test database. Never set the test database URL to the production database.

The unit suite includes booking status transition checks. Integration coverage includes authentication, booking overlap query behavior, and safeguards against accidentally using the main database. Integration tests use only `DATABASE_URL_TEST` after confirming it differs from `DATABASE_URL`.

## Project layout

```text
src/
  app/
    api/
      auth/[...all]/route.ts   Better Auth GET and POST handlers
      health/route.ts          Database health check
    clients/
      page.tsx                 Authenticated client list and search
      actions.ts               Client create, edit, and delete server actions
      client-form.tsx          Create client form
      client-edit-form.tsx     Edit client form
      client-delete-button.tsx Delete client control
    services/
      page.tsx                 Authenticated service menu
      actions.ts               Service creation server action
      service-form.tsx         Create service form
    bookings/
      page.tsx                 Authenticated booking list
      actions.ts               Booking create, cancel, and status actions
      booking-form.tsx         Create booking form
      booking-status-control.tsx Booking status control
      cancel-booking-button.tsx Cancel booking control
    sign-in/page.tsx           Sign-in form
    sign-up/page.tsx           Registration form
    page.tsx                   Authenticated dashboard
  lib/
    auth.ts                    Browser-side Better Auth client
    bookings/
      conflicts.ts             Booking overlap query condition
      status.ts                Booking status transition rules
    db/
      app-schema.ts            Client, service, and booking schemas
      auth-schema.ts           Better Auth Drizzle schema
      auth.ts                  Server-side Better Auth configuration
      index.ts                 Neon and Drizzle database connection
drizzle/                        SQL migrations and migration metadata
tests/                          Unit and integration tests
drizzle.config.ts               Drizzle Kit configuration
vitest.config.ts                Unit test configuration
vitest.integration.config.ts    Integration test configuration
```

## Deployment

Deploy as a Next.js application on a Node.js-compatible platform. Configure `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL` in the deployment environment, then apply migrations to the deployment database. Set `BETTER_AUTH_URL` to the public application URL. Do not expose server secrets with a `NEXT_PUBLIC_` prefix.

## Current scope

Client management supports creating, searching, editing, and deleting owner-scoped records. Services can be created and viewed; service editing and deletion are not currently available. Bookings can be created, listed, cancelled, and moved through allowed statuses. Booking creation checks for overlapping non-cancelled appointments for the same account. The dashboard's figures and appointment preview remain sample data, and the dashboard booking buttons are placeholders. There is not yet a calendar or availability-management interface.
