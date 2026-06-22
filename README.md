# GhostNote

GhostNote is an anonymous messaging platform that allows users to generate one-time links to receive messages securely. Users can manage their links through a web dashboard or directly via a Telegram bot. All submitted messages are encrypted at rest.

## Architecture

The project is built entirely on the Cloudflare ecosystem, utilizing Cloudflare Workers, D1 (SQLite), KV, and OpenNext.

The architecture consists of three core services running as independent Cloudflare Workers:
1. **API Service**: The core backend handling database interactions, authentication, message encryption, and business logic.
2. **Web Frontend**: A Next.js application providing the landing page, user dashboard, and public submission forms.
3. **Telegram Bot**: A webhook-based bot that allows users to create and manage links entirely within the Telegram app.

The API and Telegram Bot communicate securely using Cloudflare Service Bindings, bypassing the public internet.

## Repository Structure

This repository acts as a monorepo containing the following workspaces:

* [api/](./api/README.md): Cloudflare Worker (Hono + Drizzle ORM + D1)
* [ghostnote-web/](./ghostnote-web/README.md): Next.js Frontend (OpenNext + Tailwind CSS)
* [telegram-bot/](./telegram-bot/README.md): Cloudflare Worker (Telegram Webhook Handler + KV)

## High Level Setup

To run this project locally, ensure you have Node.js and Wrangler installed.

1. Install dependencies in each workspace.
2. Configure `.dev.vars` in the respective workspaces and fill in the required secrets.
3. Run `npm run dev` in the `api`, `telegram-bot`, and `ghostnote-web` directories.

## Deployment

Deployment is managed via Wrangler for the Workers and OpenNext for the Next.js frontend. 

1. Ensure all secrets are set in your Cloudflare account using `npx wrangler secret put`.
2. Deploy the database migrations using `npm run db:generate` and applying them.
3. Run `npm run deploy` in each workspace.
