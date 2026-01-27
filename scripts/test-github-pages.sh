#!/bin/bash
# Test GitHub Pages deployment with Playwright
# This script runs E2E tests against the live GitHub Pages deployment

set -e

GITHUB_PAGES_URL="https://arcade-cabinet.github.io/otter-river-rush"

echo "🧪 Testing GitHub Pages deployment at: $GITHUB_PAGES_URL"
echo ""

# Check if the site is accessible
echo "1️⃣ Checking if site is accessible..."
if curl -s -o /dev/null -w "%{http_code}" "$GITHUB_PAGES_URL" | grep -q "200"; then
  echo "✅ Site is accessible (HTTP 200)"
else
  echo "❌ Site returned non-200 status code"
  exit 1
fi

echo ""
echo "2️⃣ Running Playwright E2E tests against deployment..."

# Run tests with BASE_URL set to GitHub Pages
BASE_URL="$GITHUB_PAGES_URL" pnpm exec playwright test tests/e2e/web-rendering.spec.ts \
  --reporter=html \
  --reporter=list

echo ""
echo "✅ Deployment tests completed!"
echo ""
echo "📊 View detailed report:"
echo "   pnpm exec playwright show-report"
