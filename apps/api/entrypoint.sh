#!/bin/sh
set -e

echo "🔄 Running Prisma migrations..."
npx prisma db push --skip-generate

echo "✅ Migrations complete. Starting server..."
exec node dist/server.js
