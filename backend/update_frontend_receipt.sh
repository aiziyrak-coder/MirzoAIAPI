#!/bin/bash

# Update Frontend with Receipt View Feature

set -e

echo "🔄 Updating Frontend with Receipt View..."
echo "=========================================="

cd /root/mirzoai/frontend

# 1. Force reset to remote
echo "📥 Force resetting to remote..."
git fetch origin
git reset --hard origin/main || true
git clean -fd || true

# 2. Build frontend
echo "🏗️ Building frontend..."
npm run build

# 3. Reload nginx
echo "🔄 Reloading Nginx..."
systemctl reload nginx

echo ""
echo "=========================================="
echo "🎉 Frontend updated!"
echo "📍 Receipt view feature is now available in admin panel"
