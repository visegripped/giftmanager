# Docker (local Postgres only)

```bash
docker compose up -d
```

Postgres runs on port **5433** by default. Schema is bootstrapped from `docker/postgres/init.sql`.

Connection string (see `.env.example`):

```
postgresql://giftmanager:giftmanager_local_password@localhost:5433/giftmanager
```

Then run the app with `pnpm dev`.
