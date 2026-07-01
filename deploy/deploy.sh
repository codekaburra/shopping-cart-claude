#!/usr/bin/env bash
# Deploy / redeploy the app
# Run as the ubuntu user (NOT root): bash deploy/deploy.sh
set -euo pipefail

# Refuse to run as root. Running with sudo makes npm write root-owned files
# into node_modules, which then break the next non-sudo deploy (EACCES).
if [ "$(id -u)" -eq 0 ]; then
  echo "ERROR: do not run deploy.sh with sudo/root."
  echo "Run it as the ubuntu user:  bash deploy/deploy.sh"
  exit 1
fi

APP_DIR="/home/ubuntu/shopping-cart-claude"
REPO="git@github.com:codekaburra/shopping-cart-claude.git"
BRANCH="${1:-main}"

echo "=== Deploying branch: $BRANCH ==="

# Clone or pull
if [ ! -d "$APP_DIR/.git" ]; then
  echo "=== Cloning repo ==="
  git clone -b "$BRANCH" "$REPO" "$APP_DIR"
  cd "$APP_DIR"
else
  cd "$APP_DIR"
  echo "=== Pulling latest ==="
  git fetch origin
  git checkout "$BRANCH"
  git pull origin "$BRANCH"
fi

# Check .env exists
if [ ! -f .env ]; then
  echo ""
  echo "ERROR: .env file not found!"
  echo "Create it first:"
  echo '  cat > .env << EOF'
  echo '  DATABASE_URL="file:./prod.db"'
  echo '  SESSION_SECRET="<generate-a-32-byte-random-string>"'
  echo '  ADMIN_USERNAME="admin"'
  echo '  ADMIN_PASSWORD="<your-secure-password>"'
  echo '  EOF'
  echo ""
  exit 1
fi

echo "=== Installing dependencies ==="
npm ci

echo "=== Generating Prisma client ==="
npx prisma generate

echo "=== Running database migrations ==="
npx prisma migrate deploy

echo "=== Building ==="
npm run build

echo "=== Restarting PM2 ==="
pm2 startOrRestart ecosystem.config.js
pm2 save

echo ""
echo "Deploy complete! App running at http://$(curl -s ifconfig.me)"
