#!/bin/bash
# This script imports items.sql and users.sql into the giftmanager database

set -e

MYSQL_HOST="${MYSQL_HOST:-mysql}"
MYSQL_USER="${MYSQL_USER:-root}"
MYSQL_PASSWORD="${MYSQL_ROOT_PASSWORD:-root_password}"
DATA_DIR="${DATA_DIR:-/data}"

echo "Waiting for MySQL to accept connections..."
until mysql -h "$MYSQL_HOST" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SELECT 1" &>/dev/null; do
    sleep 1
done

echo "MySQL is ready. Importing data files..."

# Import items.sql
if [ -f "$DATA_DIR/items.sql" ]; then
    echo "Importing items.sql..."
    mysql -h "$MYSQL_HOST" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" giftmanager < "$DATA_DIR/items.sql" 2>&1 | grep -v "already exists" || true
    echo "Items table imported successfully"
    
    # Delete items.sql from host (requires bind mount, not read-only)
    if [ -w "$DATA_DIR/items.sql" ]; then
        echo "Deleting items.sql..."
        rm -f "$DATA_DIR/items.sql"
    else
        echo "Note: items.sql is read-only. Please delete it manually from php/items.sql"
    fi
else
    echo "Warning: items.sql not found at $DATA_DIR/items.sql"
fi

# Import users.sql
if [ -f "$DATA_DIR/users.sql" ]; then
    echo "Importing users.sql..."
    mysql -h "$MYSQL_HOST" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" giftmanager < "$DATA_DIR/users.sql" 2>&1 | grep -v "already exists" || true
    echo "Users table imported successfully"
    
    # Delete users.sql from host
    if [ -w "$DATA_DIR/users.sql" ]; then
        echo "Deleting users.sql..."
        rm -f "$DATA_DIR/users.sql"
    else
        echo "Note: users.sql is read-only. Please delete it manually from php/users.sql"
    fi
else
    echo "Warning: users.sql not found at $DATA_DIR/users.sql"
fi

echo "Data import complete!"

