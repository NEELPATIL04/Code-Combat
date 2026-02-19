#!/bin/bash
# Run the seed-problems script with server .env credentials
# Usage: bash run-seed.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"
JSON_FILE="$SCRIPT_DIR/merged_problems.json"

echo "=== Loading env from $ENV_FILE ==="
export $(grep -v '^#' "$ENV_FILE" | xargs)

echo "=== DB: $DB_NAME @ $DB_HOST ==="
echo "=== JSON: $JSON_FILE ==="

if [ ! -f "$JSON_FILE" ]; then
  echo "ERROR: merged_problems.json not found at $JSON_FILE"
  echo "Please copy merged_problems.json to $SCRIPT_DIR/"
  exit 1
fi

echo "=== Running seed script... ==="
node "$SCRIPT_DIR/seed-problems.js"
