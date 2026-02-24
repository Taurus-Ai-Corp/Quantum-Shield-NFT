#!/bin/bash
#
# Quantum-Shield-NFT - Production Deployment Script
# Deploys frontend to Vercel with pre-deployment checks
#

set -e

echo "🚀 Quantum-Shield-NFT Production Deployment"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Pre-deployment checks
echo "📋 Step 1: Pre-deployment verification"
echo ""

echo -n "Running TypeScript check... "
if npm run typecheck > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${RED}✗${NC}"
  echo "TypeScript errors found. Run 'npm run typecheck' for details."
  exit 1
fi

echo -n "Running linter... "
if npm run lint > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${RED}✗${NC}"
  echo "Linting errors found. Run 'npm run lint' for details."
  exit 1
fi

echo -n "Running tests... "
if npm test > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${RED}✗${NC}"
  echo "Tests failed. Run 'npm test' for details."
  exit 1
fi

echo ""
echo -e "${GREEN}All checks passed!${NC}"
echo ""

# Step 2: Check Vercel CLI
echo "📦 Step 2: Verify Vercel CLI"
echo ""

if ! command -v vercel &> /dev/null; then
  echo -e "${YELLOW}Vercel CLI not found. Installing...${NC}"
  npm install -g vercel
fi

echo -e "${GREEN}Vercel CLI ready${NC}"
echo ""

# Step 3: Build locally
echo "🔨 Step 3: Build frontend"
echo ""

cd web
if npm run build; then
  echo -e "${GREEN}Build successful!${NC}"
else
  echo -e "${RED}Build failed!${NC}"
  exit 1
fi
cd ..
echo ""

# Step 4: Deploy
echo "🚀 Step 4: Deploy to Vercel"
echo ""

read -p "Deploy to production? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  cd web
  vercel --prod
  cd ..
  echo ""
  echo -e "${GREEN}Deployment complete!${NC}"
  echo ""
  echo "📊 Next steps:"
  echo "1. Visit deployment URL and verify functionality"
  echo "2. Check Vercel dashboard for deployment status"
  echo "3. Run smoke tests on production URL"
  echo "4. Monitor error logs for first 24 hours"
else
  echo -e "${YELLOW}Deployment cancelled.${NC}"
  exit 0
fi
