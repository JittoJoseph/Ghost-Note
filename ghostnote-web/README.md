# GhostNote Web

The Web workspace is a Next.js application that provides the public landing page, user dashboard, and public submission pages for GhostNote.

## Purpose & Responsibilities

* Serves the public-facing application utilizing React and Next.js App Router.
* Interacts with the `ghostnote-api` for all stateful data (authentication, links, stats, submissions).
* Uses Tailwind CSS for responsive and modern styling.
* Deployed seamlessly to Cloudflare Workers using OpenNext.

## Key Features

* **OpenNext Cloudflare**: Builds and optimizes the Next.js application to run natively on the Cloudflare edge.
* **Tailwind CSS V4**: Utility-first CSS styling for rapid UI development.
* **Component-Driven**: Reusable UI components grouped logically in the `components/ui/` directory.

## Project Structure

* `app/`: Next.js App Router definitions.
  * `page.tsx`: The public landing page.
  * `dashboard/`: The authenticated user dashboard for managing links and viewing messages.
  * `l/[slug]/`: The public anonymous submission page.
  * `auth/`: Login and registration routes.
* `components/`: React components.
  * `ui/`: Presentational, reusable blocks.
  * `layout/`: Layout wrappers.
* `lib/`: Context providers and utilities.
* `public/`: Static assets.

## Local Development

```bash
# Install dependencies
npm install

# Run the local development server
npm run dev

# Preview the built OpenNext Cloudflare output
npm run preview
```

## Deployment

Deployment uses OpenNext to compile the Next.js app and Wrangler to upload it to Cloudflare.

```bash
npm run deploy
```
