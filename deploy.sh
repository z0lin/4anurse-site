#!/bin/bash
# Deploy script for 4aNurse on CloudPanel
# Run this from your site root on the server
# Usage: ./deploy.sh

set -e

echo "→ Pulling latest from git..."
git pull origin main

echo "→ Installing dependencies..."
npm ci

echo "→ Building site..."
npm run build

echo "→ Copying build to web root..."
# CloudPanel static sites serve from htdocs/
# Adjust path if your CloudPanel site root differs
rsync -a --delete dist/ ./htdocs/

echo "✓ Deploy complete."
