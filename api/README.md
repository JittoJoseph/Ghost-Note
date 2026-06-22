# GhostNote API

The API service is the core backend for GhostNote, running as a Cloudflare Worker. It is responsible for database interactions, authentication, message encryption, and business logic.

## Purpose & Responsibilities

* Serves RESTful endpoints for the Web Frontend (authentication, dashboard stats, links).
* Handles public submissions and validates access passwords.
* Interacts with Cloudflare D1 (SQLite) via Drizzle ORM.
* Secures stored messages using AES-GCM encryption at rest via the Web Crypto API.
* Communicates directly with the `telegram-bot` service via Cloudflare Service Bindings to push notifications.

## Key Features

* **Hono Framework**: Lightweight routing.
* **Drizzle ORM**: Type-safe database queries.
* **Service Bindings**: Secure, private network communication to the Telegram bot worker (`c.env.BOT.fetch`).
* **Encryption at Rest**: Messages are encrypted seamlessly on insert and decrypted on retrieval.

## Project Structure

* `src/db/`: Drizzle schema and migrations.
* `src/middleware/`: Authentication checks (JWT, Internal Service Secret).
* `src/routes/`: Hono route handlers (`links.ts`, `dashboard.ts`, `user.ts`, `internal.ts`).
* `src/utils/`: Shared utilities (`encryption.ts`, `password.ts`, `slug.ts`, `telegram.ts`).
* `drizzle/`: Generated SQL migrations.

## Environment Variables & Secrets

Local variables are defined in `.dev.vars`. Production secrets must be set using Wrangler.

* `JWT_SECRET`: Secret used to sign session cookies for the web dashboard.
* `INTERNAL_SERVICE_SECRET`: Pre-shared key to authenticate requests coming from the `telegram-bot` service.
* `MESSAGE_ENCRYPTION_KEY`: 256-bit secure key used for AES-GCM message encryption.
* `FRONTEND_URL`: (Optional) Base URL for formatting generated links.

## Local Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Generate new Drizzle migrations (after editing schema.ts)
npm run db:generate
```

## Deployment

Deploy the worker to Cloudflare:

```bash
npm run deploy
```
