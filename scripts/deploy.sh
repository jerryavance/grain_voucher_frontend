#!/usr/bin/env bash
# Deploy the React build to grain_voucher production OR staging.
#
# Usage:
#   ./scripts/deploy.sh prod
#   ./scripts/deploy.sh staging
#
# What it does:
#   1. Confirms you're on the right git branch for that target
#   2. Builds with the correct REACT_APP_API_BASE_URL
#   3. Verifies the API URL is actually baked into the bundle
#   4. Packages + scp's to /tmp on the server
#   5. Tells you the exact server-side commands to run next
#
# Safety: refuses to silently build with the wrong API URL.

set -euo pipefail

TARGET="${1:-}"
SERVER="root@157.245.165.113"

case "$TARGET" in
  prod|production)
    TARGET=prod
    EXPECTED_API="https://api.grainvoucher.com/api/"
    EXPECTED_BRANCH="main"
    SERVER_PATH="/var/www/grain_voucher/production/frontend/grain_voucher_frontend"
    NPM_SCRIPT="build:prod"
    ;;
  staging)
    EXPECTED_API="https://staging-api.grainvoucher.com/api/"
    EXPECTED_BRANCH="staging"
    SERVER_PATH="/var/www/grain_voucher/staging/frontend/grain_voucher_frontend"
    NPM_SCRIPT="build:staging"
    ;;
  *)
    echo "Usage: $0 prod|staging"
    exit 1
    ;;
esac

# ── 1. Branch sanity check ──────────────────────────────────────────────
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "$EXPECTED_BRANCH" ]; then
  echo "❌ You are on '$CURRENT_BRANCH' but deploying $TARGET expects '$EXPECTED_BRANCH'."
  echo "   git checkout $EXPECTED_BRANCH && git pull"
  exit 1
fi

# ── 2. Build with explicit env ──────────────────────────────────────────
echo "🛠  Building for $TARGET (API: $EXPECTED_API)…"
npm run "$NPM_SCRIPT"

# ── 3. Sanity-check the baked URL ───────────────────────────────────────
BAKED=$(grep -oE 'https?://[a-zA-Z0-9.-]+/api/?' build/static/js/main.*.js | sort -u)
echo "🔎 Baked API URL in bundle: $BAKED"
if ! echo "$BAKED" | grep -q "$EXPECTED_API"; then
  echo "❌ Bundle does not contain expected API URL ($EXPECTED_API)."
  echo "   Did REACT_APP_API_BASE_URL leak from .env.local?"
  exit 1
fi

# Refuse if BOTH urls are present (defense in depth)
if echo "$BAKED" | grep -q "https://api.grainvoucher.com" && \
   echo "$BAKED" | grep -q "https://staging-api.grainvoucher.com"; then
  echo "❌ Both prod AND staging API URLs are present in the bundle."
  echo "   Check src/api/index.ts / src/api/constants.ts for hardcoded fallbacks."
  exit 1
fi

# ── 4. Package + upload ────────────────────────────────────────────────
TAR_NAME="build-${TARGET}.tar.gz"
echo "📦 Packing $TAR_NAME…"
tar -czf "$TAR_NAME" build/

echo "📤 Uploading to $SERVER:/tmp/$TAR_NAME…"
scp "$TAR_NAME" "$SERVER:/tmp/$TAR_NAME"

# ── 5. Print the server-side commands the user must run ────────────────
cat <<EOF

✅ Build uploaded. Now SSH to the server and run:

   ssh $SERVER
   cd $SERVER_PATH
   sudo mv build build.backup.\$(date +%Y%m%d_%H%M%S)
   sudo tar -xzf /tmp/$TAR_NAME
   sudo chown -R deploy:deploy build
   sudo chmod -R 755 build
   rm /tmp/$TAR_NAME
   sudo systemctl reload nginx

   # Verify the deployed bundle has the right URL:
   sudo grep -oE 'https?://[a-zA-Z0-9.-]+/api/?' \\
     $SERVER_PATH/build/static/js/main.*.js | sort -u
   # Should print: $EXPECTED_API

EOF
