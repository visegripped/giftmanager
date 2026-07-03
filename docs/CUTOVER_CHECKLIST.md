# Production Cutover Checklist

Use this checklist when moving GiftManager from SiteGround (PHP + MySQL) to Vercel (Next.js + Neon Postgres).

**Do not commit database dumps to git.** Store exports in a local folder such as `migration-data/` (gitignored).

Replace placeholders:

| Placeholder                 | Your value                                                            |
| --------------------------- | --------------------------------------------------------------------- |
| `YOUR_VERCEL_URL`           | e.g. `https://giftmanager.vercel.app` or `https://gm.visegripped.com` |
| `YOUR_NEON_POSTGRES_URL`    | From Vercel → Storage → Neon → Connection string                      |
| `SITEGROUND_MYSQL_HOST`     | SiteGround MySQL hostname (cPanel → Site Tools → MySQL)               |
| `SITEGROUND_MYSQL_USER`     | Usually your cPanel username or DB user                               |
| `SITEGROUND_MYSQL_PASSWORD` | Database password                                                     |

---

## Step 1 — Export MySQL data from SiteGround

### 1A. Confirm what you are exporting

- [ ] `giftmanager.users`
- [ ] `giftmanager.items`
- [ ] `giftmanager.item_notes`
- [ ] `reports.application_reports` (historical error/performance reports)

### 1B. Option A — phpMyAdmin (easiest on SiteGround)

1. Log in to **SiteGround Site Tools** → **Site** → **MySQL** → **phpMyAdmin**.
2. Select database **`giftmanager`** in the left sidebar.
3. For each table (`users`, `items`, `item_notes`):
   - [ ] Click the table name.
   - [ ] Click **Export** tab.
   - [ ] Format: **SQL**
   - [ ] Export method: **Quick** (or **Custom** if you want to verify row counts).
   - [ ] Click **Go** and save the file locally, e.g.:
     - `migration-data/users.sql`
     - `migration-data/items.sql`
     - `migration-data/item_notes.sql`
4. Select database **`reports`**.
   - [ ] Export table `application_reports` → `migration-data/application_reports.sql`
5. Record row counts for later validation (phpMyAdmin shows count per table):
   - [ ] `users`: ______ rows
   - [ ] `items`: ______ rows
   - [ ] `item_notes`: ______ rows
   - [ ] `application_reports`: ______ rows

### 1C. Option B — mysqldump via SSH (if SSH is enabled)

From your Mac (with SiteGround SSH access configured):

```bash
mkdir -p migration-data

# App data (giftmanager database)
mysqldump -h SITEGROUND_MYSQL_HOST -u SITEGROUND_MYSQL_USER -p \
  giftmanager users items item_notes \
  > migration-data/giftmanager-data.sql

# Reporting data (reports database)
mysqldump -h SITEGROUND_MYSQL_HOST -u SITEGROUND_MYSQL_USER -p \
  reports application_reports \
  > migration-data/reports-data.sql
```

- [ ] `giftmanager-data.sql` created
- [ ] `reports-data.sql` created

**SiteGround tip:** The MySQL host is often **not** `localhost` when connecting from your machine. Use the hostname shown in Site Tools → MySQL → **Remote** or connect via SSH and use `localhost` on the server.

### 1D. Optional — export schema for reference

If you want a reference of the old MySQL column types:

```bash
mysqldump -h SITEGROUND_MYSQL_HOST -u SITEGROUND_MYSQL_USER -p \
  --no-data giftmanager users items item_notes \
  > migration-data/giftmanager-schema.sql
```

- [ ] Schema dump saved (optional)

### 1E. Backup safety check

- [ ] Dumps are stored **outside** the git repo or in `migration-data/` (gitignored)
- [ ] You have row counts written down for validation in Step 2
- [ ] SiteGround site is still live (do not delete until Step 4 DNS cutover succeeds)

---

## Step 2 — Import data into Neon Postgres

### 2A. Provision Neon on Vercel

1. [ ] Deploy the app to Vercel (Hobby) from GitHub at least once.
2. [ ] In Vercel project → **Storage** → **Connect Database** → **Neon** (Free).
3. [ ] Confirm `POSTGRES_URL` appears under **Settings → Environment Variables** (Production + Preview).
4. [ ] Copy the connection string for local use (do not commit it):
   ```bash
   export POSTGRES_URL="postgresql://..."
   ```

### 2B. Create empty Postgres schema

Run the migration SQL against your **Neon** database (not local Docker):

**Option 1 — Neon SQL Editor**

1. [ ] Open [Neon Console](https://console.neon.tech) → your project → **SQL Editor**.
2. [ ] Paste contents of [`drizzle/migrations/0000_initial.sql`](../drizzle/migrations/0000_initial.sql) and run.

**Option 2 — psql from your Mac**

```bash
# Install psql if needed: brew install libpq && brew link --force libpq
psql "$POSTGRES_URL" -f drizzle/migrations/0000_initial.sql
```

- [ ] All four tables exist: `users`, `items`, `item_notes`, `application_reports`

Verify:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### 2C. Import data (choose one method)

MySQL dumps are **not** directly compatible with Postgres. Use one of the methods below.

---

#### Method 1 — CSV via phpMyAdmin + Neon SQL Editor (recommended for small datasets)

**Export CSV from SiteGround phpMyAdmin**

For each MySQL table:

1. [ ] phpMyAdmin → select table → **Export** → Format **CSV**
2. [ ] Save as `migration-data/users.csv`, `items.csv`, etc.

**Import into Neon**

Neon’s SQL Editor can run `COPY` if you upload CSV through a client, or you can use **psql**:

```bash
psql "$POSTGRES_URL"
```

Example for `users` (adjust column order to match your CSV header row):

```sql
-- Temporarily allow explicit IDs (preserves userid for foreign keys)
COPY users (userid, firstname, lastname, groupid, created, email, avatar, birthday_month, birthday_day)
FROM STDIN WITH (FORMAT csv, HEADER true, NULL '');
-- paste CSV content or use \copy from a local file in psql
```

From terminal with local CSV files:

```bash
psql "$POSTGRES_URL" -c "\copy users FROM 'migration-data/users.csv' WITH (FORMAT csv, HEADER true, NULL '')"
psql "$POSTGRES_URL" -c "\copy items FROM 'migration-data/items.csv' WITH (FORMAT csv, HEADER true, NULL '')"
psql "$POSTGRES_URL" -c "\copy item_notes FROM 'migration-data/item_notes.csv' WITH (FORMAT csv, HEADER true, NULL '')"
psql "$POSTGRES_URL" -c "\copy application_reports FROM 'migration-data/application_reports.csv' WITH (FORMAT csv, HEADER true, NULL '')"
```

**Import order matters** (foreign keys):

1. [ ] `users`
2. [ ] `items`
3. [ ] `item_notes`
4. [ ] `application_reports`

**Reset sequences** after importing with explicit IDs:

```sql
SELECT setval(pg_get_serial_sequence('users', 'userid'), COALESCE(MAX(userid), 1)) FROM users;
SELECT setval(pg_get_serial_sequence('items', 'itemid'), COALESCE(MAX(itemid), 1)) FROM items;
SELECT setval(pg_get_serial_sequence('item_notes', 'noteid'), COALESCE(MAX(noteid), 1)) FROM item_notes;
SELECT setval(pg_get_serial_sequence('application_reports', 'id'), COALESCE(MAX(id), 1)) FROM application_reports;
```

- [ ] Sequences reset

**Column name mapping (MySQL → Postgres)**

| MySQL column          | Postgres column       | Notes                                    |
| --------------------- | --------------------- | ---------------------------------------- |
| `userid`              | `userid`              | same                                     |
| `birthday_month`      | `birthday_month`      | same                                     |
| `added_by_userid`     | `added_by_userid`     | same                                     |
| `date_added`          | `date_added`          | MySQL datetime → Postgres timestamptz    |
| `report_type`         | `report_type`         | MySQL ENUM → text in Postgres            |
| `performance_metrics` | `performance_metrics` | MySQL JSON → JSONB (valid JSON required) |

If CSV import fails on JSON columns in `application_reports`, export those columns as raw JSON strings or import reports separately after the main app tables work.

---

#### Method 2 — pgloader (automated, if you install it)

```bash
brew install pgloader
```

Create `migration-data/mysql.load`:

```
LOAD DATABASE
  FROM mysql://SITEGROUND_MYSQL_USER:PASSWORD@SITEGROUND_MYSQL_HOST/giftmanager
  INTO postgresql://NEON_USER:NEON_PASSWORD@NEON_HOST/giftmanager

INCLUDING ONLY TABLE NAMES MATCHING 'users', 'items', 'item_notes'

WITH preserve index names, reset sequences

SET work_mem to '16MB', maintenance_work_mem to '512MB';
```

Run a second load for the `reports` database targeting `application_reports`, or import that table via CSV.

- [ ] pgloader completed without errors
- [ ] Sequences reset (pgloader usually handles this)

---

#### Method 3 — Manual INSERT from MySQL dump (last resort)

1. [ ] Open each `.sql` dump in a text editor.
2. [ ] Convert MySQL syntax to Postgres (backticks → double quotes, remove `ENGINE=InnoDB`, etc.).
3. [ ] Use `INSERT INTO users (...) OVERRIDING SYSTEM VALUE VALUES (...)` to preserve IDs.
4. [ ] Run converted SQL in Neon SQL Editor in table order: users → items → item_notes → application_reports.

This is tedious; prefer Method 1 or 2.

---

### 2D. Validate import

Run in Neon SQL Editor:

```sql
SELECT 'users' AS tbl, COUNT(*) FROM users
UNION ALL SELECT 'items', COUNT(*) FROM items
UNION ALL SELECT 'item_notes', COUNT(*) FROM item_notes
UNION ALL SELECT 'application_reports', COUNT(*) FROM application_reports;
```

- [ ] Row counts match Step 1E notes
- [ ] Spot-check a known user:
  ```sql
  SELECT userid, email, firstname FROM users WHERE email = 'your-email@example.com';
  ```
- [ ] Spot-check items for that user:
  ```sql
  SELECT itemid, name, status FROM items WHERE userid = 1 LIMIT 5;
  ```

### 2E. Smoke-test on Vercel Preview

Before changing DNS, test against Neon using a **Preview** deployment:

1. [ ] Confirm Vercel Preview env has `POSTGRES_URL` (Neon integration usually sets this for all envs).
2. [ ] Set remaining secrets on Preview: `FB_APP_SECRET`, `CRON_SECRET`, `NEXT_PUBLIC_*`, `GOOGLE_OAUTH_CLIENT_ID`.
3. [ ] Open the Preview URL (from a PR or `vercel deploy`).
4. [ ] Sign in with Google — confirm your user is recognized.
5. [ ] View your gift list — confirm items appear.
6. [ ] View another user’s list — confirm shared data works.
7. [ ] Add a test item, then delete or archive it (optional sanity check).

- [ ] Preview deployment works end-to-end with migrated data

---

## Step 3 — Update OAuth consoles

You need both providers to allow your **new Vercel URLs**. Keep existing SiteGround URLs until DNS cutover (Step 4) so the old site still works during transition.

### 3A. Google Cloud Console

1. [ ] Go to [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**.
2. [ ] Open your **OAuth 2.0 Client ID** (the one matching `NEXT_PUBLIC_GOOGLE_CLIENT_ID`).
3. [ ] Under **Authorized JavaScript origins**, add:
   - [ ] `http://localhost:3000` (local Next.js dev)
   - [ ] `YOUR_VERCEL_URL` (e.g. `https://giftmanager.vercel.app`)
   - [ ] `https://gm.visegripped.com` (if using custom domain on Vercel)
   - [ ] Keep existing origins until old site is retired (e.g. `https://gm.visegripped.com` on SiteGround if different)
4. [ ] Under **Authorized redirect URIs** (if used by your OAuth flow), add the same origins as needed.
5. [ ] Click **Save**.

**Note:** Google One Tap / `@react-oauth/google` primarily needs **JavaScript origins**, not redirect URIs.

- [ ] Google sign-in works on Preview URL
- [ ] Google sign-in works on `http://localhost:3000` (optional local check)

### 3B. Facebook Developer Console

1. [ ] Go to [Meta for Developers](https://developers.facebook.com/) → **My Apps** → your app.
2. [ ] **Settings → Basic**
   - [ ] **App Domains**: add your domain without `https://`, e.g.:
     - `giftmanager.vercel.app`
     - `gm.visegripped.com`
     - `localhost` (for local dev; Facebook requires HTTPS for production — local may need tunnel or skip FB locally)
3. [ ] **Facebook Login → Settings**
   - [ ] **Valid OAuth Redirect URIs**: add:
     - `YOUR_VERCEL_URL/`
     - `https://gm.visegripped.com/`
     - `http://localhost:3000/` (if testing locally with HTTPS — see below)
4. [ ] Ensure app is in **Live** mode (not Development-only) if non-developer family members need to log in.
5. [ ] Click **Save Changes**.

**Facebook + local dev:** Facebook requires HTTPS. Options:

- Use `next dev --experimental-https` with certs in `docker/ssl/`, or
- Test Facebook login on Vercel Preview only.

- [ ] Facebook sign-in works on Preview URL (or production after DNS)

### 3C. Confirm Vercel environment variables match OAuth apps

In **Vercel → Project → Settings → Environment Variables** (Production + Preview):

| Variable                       | Must match                             |
| ------------------------------ | -------------------------------------- |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth Client ID                 |
| `GOOGLE_OAUTH_CLIENT_ID`       | Same value as above                    |
| `NEXT_PUBLIC_FB_APP_ID`        | Facebook App ID                        |
| `FB_APP_SECRET`                | Facebook App Secret (Settings → Basic) |

- [ ] All four variables set for **Production**
- [ ] All four variables set for **Preview**
- [ ] Redeploy after changing env vars (Vercel → Deployments → Redeploy)

### 3D. Final OAuth verification

- [ ] Google login on production/preview URL
- [ ] Facebook login on production/preview URL
- [ ] After login, `confirmUserIsValid` succeeds (you see your list, not “not logged in”)
- [ ] Avatar updates still work (optional)

---

## Step 4 — DNS cutover (after Steps 1–3 pass)

_Not part of the original three steps, but required to go live._

1. [ ] In Vercel → Project → **Settings → Domains**, add `gm.visegripped.com`.
2. [ ] At your DNS provider, set CNAME `gm` → `cname.vercel-dns.com` (or values Vercel shows).
3. [ ] Wait for DNS + SSL (usually minutes to a few hours).
4. [ ] Verify production: `https://gm.visegripped.com`
5. [ ] Enable Vercel Cron (already in `vercel.json`) — confirm `CRON_SECRET` is set.
6. [ ] Decommission SiteGround PHP hosting when satisfied.

---

## Troubleshooting

| Symptom                        | Things to check                                                              |
| ------------------------------ | ---------------------------------------------------------------------------- |
| “Invalid/expired token” on API | `GOOGLE_OAUTH_CLIENT_ID` matches Google console client ID; token not expired |
| Google button does nothing     | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` set; origin added in Google console           |
| Facebook button missing        | `NEXT_PUBLIC_FB_APP_ID` set in Vercel env                                    |
| Facebook login fails           | `FB_APP_SECRET` correct; domain in App Domains; app is Live                  |
| Empty gift lists after login   | `POSTGRES_URL` points to Neon DB with migrated data; row counts validated    |
| “No user found for email”      | `users` table imported; email matches Google/Facebook account                |
| API 500 errors                 | Vercel → Deployment → **Functions** logs; Neon connection string valid       |

---

## Quick reference — files in this repo

| File                                                                            | Purpose                  |
| ------------------------------------------------------------------------------- | ------------------------ |
| [`.env.example`](../.env.example)                                               | Local env template       |
| [`drizzle/migrations/0000_initial.sql`](../drizzle/migrations/0000_initial.sql) | Postgres schema for Neon |
| [`docs/VERCEL_SETUP.md`](VERCEL_SETUP.md)                                       | Vercel project setup     |
| [`vercel.json`](../vercel.json)                                                 | Cron + build config      |

---

_Last updated: migration to Next.js 2.0.0_
