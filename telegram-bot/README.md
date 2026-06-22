# GhostNote Telegram Bot

The Telegram Bot service is a lightweight Cloudflare Worker designed to receive webhooks directly from the Telegram API. It acts as an alternative client interface for users to generate and manage anonymous GhostNote links without needing the web UI.

## Purpose & Responsibilities

* Receives and parses incoming webhook payloads from Telegram.
* Manages user conversational state using Cloudflare KV.
* Authenticates users and triggers link creation within the `ghostnote-api` via Cloudflare Service Bindings.
* Exposes an internal `notify` endpoint for the API to securely send open/submission notifications back to Telegram users.

## Key Features

* **Stateless Webhook**: Runs entirely on the edge, triggered only when Telegram sends an update.
* **Native UI Elements**: Utilizes Telegram's inline keyboards and monospace formatting for a seamless 1-tap copy experience.
* **Service Bindings**: Securely calls the `ghostnote-api` (`c.env.API.fetch`) entirely within the internal Cloudflare network.

## Project Structure

* `src/index.ts`: The primary Hono router handling both the Telegram webhook and the internal notification proxy endpoint.
* `src/env.ts`: Cloudflare bindings types.
* `wrangler.jsonc`: Service configuration including KV binding and the `ghostnote-api` service binding.

## Environment Variables & Secrets

Local variables are defined in `.dev.vars`. Production secrets must be set using Wrangler.

* `TELEGRAM_BOT_TOKEN`: The private API token provided by BotFather.
* `INTERNAL_SERVICE_SECRET`: Pre-shared key to securely authenticate cross-service requests sent to the API.
* `BOT_STATE_KV`: Cloudflare KV namespace binding for storing multi-step conversation states (e.g., waiting for a password).

## Local Development

```bash
# Install dependencies
npm install

# Run the local development server
npm run dev
```

*Note: To test Telegram webhooks locally, you must use a tunneling service (like ngrok or Cloudflare Tunnels) and register that URL with the Telegram API using `setWebhook`.*

## Deployment

Deploy the worker to Cloudflare:

```bash
npm run deploy
```
