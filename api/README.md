# GhostNote API

GhostNote is a secure anonymous messaging platform.

## Development

First, copy `.dev.vars.example` to `.dev.vars` (or create `.dev.vars`) and set your secrets:
```env
JWT_SECRET=your-super-secret-key-for-local-dev
```

### Database Setup

We use Cloudflare D1 for our database and Drizzle ORM.

To initialize your local D1 database, apply the migrations:
```bash
pnpm run db:generate
pnpm run db:migrate
```

### Running Locally

To start the development server:
```bash
pnpm run dev
```

## Available Scripts

- `pnpm run dev` - Start the local development server using Wrangler
- `pnpm run db:generate` - Generate SQL migrations from the Drizzle schema
- `pnpm run db:migrate` - Apply the pending migrations to the local D1 database
- `pnpm run cf-typegen` - Generate TypeScript types for Cloudflare bindings
- `pnpm run deploy` - Deploy the worker to Cloudflare
