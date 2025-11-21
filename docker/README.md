# Docker Configuration

This directory contains Docker configuration files for local development.

## Files

### `/php/`

- `apache-config.conf` - Apache virtual host configuration
- `php.ini` - PHP runtime configuration

### `/mysql/`

- `init.sql` - Database initialization script (creates databases and tables)
- `import-data.sh` - Script to import SQL files and clean up

## Apache Configuration

The Apache configuration (`php/apache-config.conf`) sets up:

- Document root at `/var/www/html/public_html/`
- PHP file handling
- CORS headers for local development
- Error and access logging

This ensures `/api.php` and `/reporting.php` are accessible at the root path, matching production.

## MySQL Initialization

On first startup, MySQL runs scripts in `/docker-entrypoint-initdb.d/`:

1. `01-init.sql` - Creates `giftmanager` and `reports` databases, creates `application_reports` table
2. Data import is handled by separate `db-setup` service (run with `--profile setup`)

## Database Import Process

The `db-setup` service (docker-compose profile):

1. Waits for MySQL to be healthy
2. Imports `php/items.sql` into `giftmanager` database
3. Imports `php/users.sql` into `giftmanager` database
4. Deletes the SQL files from `php/` directory
5. Exits (one-time operation)

Run with:

```bash
docker-compose --profile setup up db-setup
```

## PHP ini Configuration

Custom PHP settings (`php/php.ini`):

- Upload size limits
- Memory limits
- Error reporting enabled for development
- Execution time limits
- Timezone set to UTC

## Volumes

- `mysql_data` - Persistent MySQL data (not deleted with `docker-compose down`)
- PHP and frontend directories are mounted for live code updates

## Networks

All services communicate via `giftmanager-network` bridge network.

## Modifying Configuration

After changing Dockerfile or configuration files:

```bash
docker-compose build
docker-compose up -d
```

After changing only `docker-compose.yml`:

```bash
docker-compose down
docker-compose up -d
```
