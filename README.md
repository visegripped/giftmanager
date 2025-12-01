# GiftManager

A modern gift list management application with reporting and analytics.

## Features

- User authentication via Google OAuth and Facebook OAuth (requires HTTPS)
- Personal and shared gift lists
- Admin dashboard with database management
- Comprehensive reporting and analytics system
- Performance monitoring
- Error tracking and debugging

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: PHP 7.4.33 + MySQL 8.0
- **Reporting**: GraphQL API with ag-grid interface
- **Deployment**: Docker containers for local development

## Quick Start

### Local Development with Docker

1. **Prerequisites**:

   - Docker Desktop installed
   - Git

2. **Clone and setup**:

   ```bash
   git clone <repository-url>
   cd giftmanager
   cp env-template.txt .env.local
   # Edit .env.local with your settings
   ```

3. **Generate SSL certificates** (required for Facebook OAuth):

   ```bash
   ./docker/generate-ssl-cert.sh
   ```

   This creates self-signed certificates for HTTPS. Your browser will show a security warning - this is normal for local development. Click "Advanced" → "Proceed to localhost" to continue.

   > **Note**: Facebook OAuth requires HTTPS. Without certificates, the app will run on HTTP but Facebook login won't work.

4. **Start services**:

   ```bash
   docker-compose up -d
   ```

5. **Import database** (first time only):

   ```bash
   docker-compose --profile setup up db-setup
   ```

6. **Access application**:
   - Frontend: https://localhost:5174 (or http://localhost:5174 if SSL not configured)
   - phpMyAdmin: http://localhost:8082
   - API: http://localhost:8081/api.php
   - Reporting: http://localhost:8081/reporting.php

See [docs/DOCKER_SETUP.md](docs/DOCKER_SETUP.md) for detailed instructions.

### Traditional Development (without Docker)

1. **Install dependencies**:

   ```bash
   pnpm install
   ```

2. **Configure environment**:

   - Set up MySQL databases
   - Configure `php/includes/api-credentials.php`
   - Configure `php/includes/report-credentials.php`
   - Set environment variables for API URLs

3. **Run development server**:
   ```bash
   pnpm dev
   ```

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm test` - Run tests
- `pnpm test:once` - Run tests once
- `pnpm lint` - Lint code
- `pnpm prettier` - Format code
- `pnpm storybook` - Start Storybook

### Deployment & Rollback

- `pnpm deploy:patch` / `deploy:minor` / `deploy:major`
  - Uses `deploy.js` to:
    - Bump version (on `master`) or create a canary version (on branches).
    - Build the frontend with versioned asset filenames.
    - Deploy PHP includes and entrypoints plus a versioned React build to:
      - `public_html/releases/<version>/...`
      - `includes/releases/<version>/...`
    - On `master`:
      - Commit `package.json` with the new version.
      - Tag the release (`v<version>`) and push tag + commit.
      - Clean up old releases (keep the 5 most recent stable versions, remove all canaries).
- `pnpm setup:siteground-keys`
  - One-time helper to materialize SSH keys from `delete-this-file.txt` into `~/.ssh` and print the `SITEGROUND_AUTH_KEY` path to use in your `.env`.
- `node deploy.js rollback <version>`
  - Updates the server-side `includes/current_version.php` to point to `<version>` if that release exists under:
    - `public_html/releases/<version>`
    - `includes/releases/<version>`
  - This changes the default frontend/backend version without rebuilding.

## Documentation

- [Docker Setup](docs/DOCKER_SETUP.md) - Local development with Docker
- [Deployment, Versioning & Rollback](AI-notes/plan-deployment-versioning.md) - Versioned deploy flow, rollback, and logging
- [Reporting System](docs/REPORTING_SYSTEM.md) - Error tracking and analytics
- [Reporting Interface](docs/REPORTING_INTERFACE.md) - Admin reporting UI
- [GraphQL API](docs/GRAPHQL_API.md) - GraphQL API reference
- [Security](README-SECURITY.md) - Credential management and security

## Database Structure

### Main Database (giftmanager)

- `items` - Gift list items
- `users` - User accounts

### Reports Database (reports)

- `application_reports` - System reports and analytics

See database schema in `docker/mysql/init.sql`.

## Reporting & Analytics

The application includes a comprehensive reporting system that tracks:

- Errors and warnings
- Performance metrics (API calls, page load)
- User interactions (clicks, navigation)
- Debug information

Reports are:

- Automatically collected by the frontend
- Stored in a dedicated database
- Queryable via GraphQL API
- Viewable in the Admin interface

Session tracking ensures all events in a browser session are linked via a Session Transaction ID (STID).

## Admin Features

Accessible to admin users (userid = 1):

- Archive purchased/removed items
- View and query application reports
- Export reports to CSV
- View performance statistics
- Debug user sessions

## Architecture

```
Frontend (React)
  ↓
  ├→ API (api.php) → MySQL (giftmanager DB)
  └→ Reporting (reporting.php) → MySQL (reports DB)
```

## Contributing

1. Follow existing patterns and naming conventions
2. Add tests for new features
3. Update documentation
4. Create Storybook stories for new components

## Security

⚠️ **Important**: This repository uses environment variables for all sensitive data. See [README-SECURITY.md](README-SECURITY.md) and [SECURITY_CHANGES.md](SECURITY_CHANGES.md) for details.

Credential files in `php/includes/*-credentials.php` are git-ignored. Example files are provided as templates.

## License

Copyright 2010-2025. All rights reserved.
