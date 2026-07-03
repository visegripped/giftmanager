# Vercel Setup

## Local development

1. Clone the repo
2. Copy `.env.example` to `.env.local` and fill in OAuth credentials
3. Start Postgres: `docker compose up -d`
4. Install dependencies: `pnpm install`
5. Run dev server: `pnpm dev` → http://localhost:3000

## Vercel deployment

1. Connect the GitHub repo to Vercel (Hobby plan)
2. Add Neon integration (Storage → Neon) — auto-injects `POSTGRES_URL`
3. Set environment variables in Vercel dashboard (see below)
4. Deploy

## Vercel environment variables

### Secrets (Production + Preview)

| Variable        | Notes                                         |
| --------------- | --------------------------------------------- |
| `POSTGRES_URL`  | Auto-set by Neon integration, or set manually |
| `FB_APP_SECRET` | Facebook app secret                           |
| `CRON_SECRET`   | Random string for daily archive cron          |

### Non-secrets (Production + Preview)

| Variable                       | Notes                                             |
| ------------------------------ | ------------------------------------------------- |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID                            |
| `NEXT_PUBLIC_FB_APP_ID`        | Facebook app ID                                   |
| `GOOGLE_OAUTH_CLIENT_ID`       | Same as Google client ID (server-side validation) |

## Data migration from MySQL

See **[CUTOVER_CHECKLIST.md](CUTOVER_CHECKLIST.md)** for step-by-step export, Neon import, OAuth, and DNS instructions with checkboxes.
