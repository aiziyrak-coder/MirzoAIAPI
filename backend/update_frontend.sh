#!/bin/bash

# Update Frontend with Tailwind CSS Fix

set -e

echo "🔄 Updating Frontend..."
echo "======================"

cd /root/mirzoai/frontend

# 1. Pull latest changes
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

# 2. Install/update dependencies
echo "📦 Installing dependencies..."
npm install

# 3. Install Tailwind CSS and PostCSS if not installed
echo "📦 Installing Tailwind CSS..."
npm install -D tailwindcss postcss autoprefixer

# 4. Build frontend
echo "🏗️ Building frontend..."
npm run build

# 5. Check build result
if [ -f "dist/index.html" ]; then
    echo "✅ Build successful!"
    ls -lh dist/ | head -10
else
    echo "❌ Build failed!"
    exit 1
fi

# 6. Reload nginx
echo "🔄 Reloading Nginx..."
systemctl reload nginx

echo ""
echo "======================"
echo "🎉 Frontend updated!"
echo "📍 Test: curl https://mirzoai.cdcgroup.uz"
