
#!/bin/sh
set -e

echo "Cleaning previous migrations (optional safety)..."
rm -rf prisma/migrations

echo "Creating initial migration (schema + constraints)..."
# Create the migration file without applying it
npx prisma migrate dev --create-only --name init

# Find the generated migration file
MIGRATION_DIR=$(ls -d prisma/migrations/*_init | tail -n 1)
SQL_FILE="$MIGRATION_DIR/migration.sql"

echo "Appending constraints to $SQL_FILE..."
cat constraints.sql >> "$SQL_FILE"

echo "Applying migration..."
npx prisma migrate dev

echo "Seeding..."
# Seed is configured in package.json to run automatically after migration if fresh, 
# but explicit seed ensures it runs.
npx prisma db seed

echo "Migration and Seed Complete!"
