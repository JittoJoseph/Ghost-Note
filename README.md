# GhostNote

GhostNote is a secure, anonymous messaging platform. Users generate single-use links to receive messages, manageable via a web dashboard or a Telegram bot interface.

## Architecture & Structure

The project is a monorepo built natively for the Cloudflare edge ecosystem. It consists of three independent Cloudflare Workers:

- [api/](./api/README.md): Core backend handling REST routes, database operations, and encryption. (Hono, Drizzle, D1) - [View API Docs](./api/API.md)
- [ghostnote-web/](./ghostnote-web/README.md): Public web interface and user dashboard. (Next.js, OpenNext, Tailwind CSS)
- [telegram-bot/](./telegram-bot/README.md): Stateless webhook handler for Telegram integration. (KV)

![GhostNote Architecture](./docs/architecture-diagram.svg)

## Security

The platform implements strict access controls and data protection mechanisms:

- **Message Encryption**: All submitted messages are encrypted at rest using AES-GCM via the Web Crypto API.
- **Link Security**: Links are single-use and require a hash-verified password for submission.
- **Authentication**: The web dashboard relies on secure JWT authentication.
- **Internal Communication**: The Telegram Bot and API communicate over a private network via Cloudflare Service Bindings, protected by internal pre-shared secrets.

## Setup

Requires Node.js and Wrangler.

1. Install dependencies across all workspaces (`npm install`).
2. Configure `.dev.vars` with required local secrets per workspace.
3. Start the local development servers (`npm run dev`).

_Note: Docker is provided strictly for local development convenience. Production deployments remain fully Cloudflare-native._

## Deployment

1. Provision production secrets using `npx wrangler secret put`.
2. Apply D1 database migrations.
3. Deploy each workspace using `npm run deploy`.
