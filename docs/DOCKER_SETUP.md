# Docker Setup Guide

This guide explains how to set up and run GiftManager locally using Docker.

## Prerequisites

- Docker Desktop installed (includes Docker Compose)
- Git
- Terminal/Command Line access

## Quick Start

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd giftmanager
   ```

2. **Set up environment variables**:

   ```bash
   cp env-template.txt .env.local
   ```

   Edit `.env.local` and set secure passwords (or use the defaults for local development).

3. **Start Docker containers**:

   ```bash
   docker-compose up -d
   ```

4. **Import database data** (first time only):

   ```bash
   docker-compose --profile setup up db-setup
   ```

   This will:

   - Import `php/items.sql` and `php/users.sql`
   - Delete the SQL files after successful import

5. **Access the application**:
   - Frontend: http://localhost:5174
   - PHP API: http://localhost:8081/api.php
   - Reporting API: http://localhost:8081/reporting.php
   - phpMyAdmin: http://localhost:8082

## Services

### PHP Service (Port 8081)

- PHP 7.4.33 with Apache
- Serves API endpoints from `php/public_html/`
- Auto-loads Composer dependencies
- Maps to: `http://localhost:8081/api.php` and `http://localhost:8081/reporting.php`
- Port configurable via `PHP_PORT` env var

### MySQL Service (Port 3307)

- MySQL 8.0
- Two databases:
  - `giftmanager` - Main application database
  - `reports` - Reporting and analytics database
- Credentials: `visegripped` / (from .env.local)
- Port configurable via `MYSQL_PORT` env var

### phpMyAdmin (Port 8082)

- MySQL database management interface
- Login with: `visegripped` / (from .env.local)
- Access at: http://localhost:8082
- Port configurable via `PHPMYADMIN_PORT` env var

### Frontend Service (Port 5174)

- Vite dev server with HMR
- React application
- Auto-reloads on file changes
- Port configurable via `FRONTEND_PORT` env var

## Docker Commands

### Start all services:

```bash
docker-compose up -d
```

### Stop all services:

```bash
docker-compose down
```

### View logs:

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f php
docker-compose logs -f mysql
docker-compose logs -f frontend
```

### Restart a service:

```bash
docker-compose restart php
docker-compose restart mysql
```

### Rebuild containers (after changing Dockerfile):

```bash
docker-compose build
docker-compose up -d
```

### Reset database (delete all data):

```bash
docker-compose down -v
docker-compose up -d
docker-compose --profile setup up db-setup
```

## Troubleshooting

### CORS Issues

If you see CORS errors:

- Check that the frontend is making requests to `http://localhost/api.php`
- Verify `VITE_API_URL` in `.env.local` is set correctly
- Ensure Apache headers are configured in `docker/php/apache-config.conf`

### Database Connection Issues

- Verify MySQL is running: `docker-compose ps`
- Check MySQL logs: `docker-compose logs mysql`
- Ensure environment variables are set correctly in `.env.local`
- Verify credentials match in both Docker and PHP credential files

### Port Conflicts

If ports are already in use:

1. Edit `docker-compose.yml`
2. Change port mappings (e.g., `"8081:80"` instead of `"80:80"`)
3. Update `.env.local` URLs accordingly

### PHP Dependencies Not Loading

```bash
docker-compose exec php composer install
docker-compose restart php
```

### Frontend Not Loading

```bash
docker-compose exec frontend pnpm install
docker-compose restart frontend
```

## File Structure in Docker

- `/var/www/html/public_html/` - PHP files (maps to `php/public_html/`)
- `/var/www/html/includes/` - PHP includes (maps to `php/includes/`)
- `/app/` - Frontend application (maps to workspace root)

## Development Workflow

1. Make code changes in your local files
2. Frontend changes auto-reload (Vite HMR)
3. PHP changes require page refresh (no restart needed)
4. Database changes require SQL execution via phpMyAdmin or mysql CLI

## Stopping Docker

To stop and remove all containers:

```bash
docker-compose down
```

To stop and remove all containers AND delete database data:

```bash
docker-compose down -v
```
