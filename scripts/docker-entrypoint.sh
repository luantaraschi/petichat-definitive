#!/bin/sh
set -e

echo "Running database migrations..."

# Wait for database to be ready
until npx prisma db push --skip-generate; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "Migrations completed successfully"

# Execute the main command
exec "$@"
