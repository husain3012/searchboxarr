#!/bin/sh
# Quick smoke test for Searchboxarr API
# Usage: ./scripts/healthcheck.sh [BASE_URL]

BASE_URL="${1:-http://localhost:9797}"

echo "Searchboxarr Health Check — $BASE_URL"
echo "════════════════════════════════════════"

# Health endpoint
HEALTH=$(curl -sf "$BASE_URL/api/health" 2>/dev/null)
if [ $? -eq 0 ]; then
  echo "✓ /api/health         OK"
  echo "  $HEALTH" | python3 -m json.tool 2>/dev/null || echo "  $HEALTH"
else
  echo "✗ /api/health         FAILED — Is Searchboxarr running?"
  exit 1
fi

echo ""

# Indexers endpoint
INDEXERS=$(curl -sf "$BASE_URL/api/indexers" 2>/dev/null)
if [ $? -eq 0 ]; then
  COUNT=$(echo "$INDEXERS" | python3 -c "import sys,json; data=json.load(sys.stdin); print(len(data))" 2>/dev/null || echo "?")
  echo "✓ /api/indexers       OK ($COUNT indexers)"
else
  echo "✗ /api/indexers       FAILED — Check PROWLARR_API_KEY and PROWLARR_URL"
fi

echo ""
echo "Done."
