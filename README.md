# GiftManager

Family gift list manager — Next.js on Vercel with Postgres.

## Quick start

```bash
cp .env.example .env.local   # add OAuth credentials
docker compose up -d         # Postgres on :5433
pnpm install
pnpm dev                     # http://localhost:3000
```

## Stack

- **Frontend:** Next.js 15 (App Router, SSR) + React 19
- **API:** Next.js Route Handlers (`/api`, `/api/reporting`)
- **Database:** Postgres (Neon in prod, Docker locally) via Drizzle ORM
- **Deploy:** Vercel Hobby + Neon Free tier

## Scripts

| Command        | Description                     |
| -------------- | ------------------------------- |
| `pnpm dev`     | Local dev server                |
| `pnpm build`   | Production build                |
| `pnpm test`    | Run unit tests                  |
| `pnpm db:push` | Push Drizzle schema to Postgres |

## Deployment

See [docs/VERCEL_SETUP.md](docs/VERCEL_SETUP.md) for Vercel project setup.

**Production cutover** (MySQL export, Neon import, OAuth): [docs/CUTOVER_CHECKLIST.md](docs/CUTOVER_CHECKLIST.md)

## Local development (Docker)

Only Postgres runs in Docker now:

```bash
docker compose up -d
```

Then `pnpm dev` — no separate PHP or Vite containers needed.
