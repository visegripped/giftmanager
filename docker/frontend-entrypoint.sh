#!/bin/sh
set -e

# Install dependencies if package.json or pnpm-lock.yaml changed
# or if node_modules is missing key packages
if [ ! -d "node_modules/react-facebook-login" ] || [ ! -d "node_modules/.pnpm" ]; then
  echo "Installing dependencies..."
  CI=true pnpm install
fi

# Execute the command (defaults to "pnpm dev --host" if no args provided)
# This allows docker-compose command override to work
if [ $# -eq 0 ]; then
  exec pnpm dev --host
else
  exec "$@"
fi

