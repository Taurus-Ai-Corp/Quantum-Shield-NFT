#!/bin/bash

# Setup GitHub Pages for QuantumShield Demo

set -e

REPO="Taurus-Ai-Corp/quantumshield-hedera-hackathon"
DEMO_DIR="demos"

echo "🚀 Setting up GitHub Pages for QuantumShield Demo"
echo "=================================================="
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed"
    echo "Install it: brew install gh"
    exit 1
fi

# Check authentication
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated to GitHub"
    echo "Run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI authenticated"
echo ""

# Create gh-pages branch with demo files
echo "📦 Creating gh-pages branch..."
git checkout -b gh-pages 2>/dev/null || git checkout gh-pages

# Copy demo files to root
echo "📁 Copying demo files..."
cp -r $DEMO_DIR/* .

# Create index redirect if needed
if [ ! -f "index.html" ]; then
    echo '<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="refresh" content="0; url=./index.html">
    <title>QuantumShield Demo</title>
</head>
<body>
    <p>Redirecting to <a href="./index.html">demo</a>...</p>
</body>
</html>' > index.html
fi

# Commit and push
git add .
git commit -m "Deploy demo to GitHub Pages" || echo "No changes to commit"
git push origin gh-pages --force

# Switch back to main
git checkout main

echo ""
echo "✅ GitHub Pages setup complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to: https://github.com/$REPO/settings/pages"
echo "2. Source: Deploy from a branch"
echo "3. Branch: gh-pages"
echo "4. Folder: / (root)"
echo "5. Save"
echo ""
echo "🌐 Your demo will be available at:"
echo "   https://taurus-ai-corp.github.io/quantumshield-hedera-hackathon/"
echo ""
