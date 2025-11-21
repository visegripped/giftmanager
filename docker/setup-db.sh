#!/bin/bash

# Setup script for local database initialization
# This script imports SQL files from the php directory

set -e

DB_PASSWORD="${DB_PASSWORD:-giftmanager_db_password}"
MYSQL_HOST="mysql"

echo "Waiting for MySQL to be ready..."
until mysql -h "$MYSQL_HOST" -u root -p"${MYSQL_ROOT_PASSWORD:-root_password}" -e "SELECT 1" &>/dev/null; do
    echo "Waiting for MySQL..."
    sleep 2
done

echo "MySQL is ready. Importing SQL files..."

# Import items.sql if it exists
if [ -f "/data/items.sql" ]; then
    echo "Importing items.sql..."
    mysql -h "$MYSQL_HOST" -u root -p"${MYSQL_ROOT_PASSWORD:-root_password}" giftmanager < /data/items.sql || {
        echo "Warning: items.sql import had issues (table may already exist)"
    }
else
    echo "Warning: items.sql not found, skipping..."
fi

# Import users.sql if it exists
if [ -f "/data/users.sql" ]; then
    echo "Importing users.sql..."
    mysql -h "$MYSQL_HOST" -u root -p"${MYSQL_ROOT_PASSWORD:-root_password}" giftmanager < /data/users.sql || {
        echo "Warning: users.sql import had issues (table may already exist)"
    }
else
    echo "Warning: users.sql not found, skipping..."
fi

echo "Database setup complete!"
echo "Note: SQL files in php/ directory should be manually deleted after verification."

