#!/bin/bash

# Update Frontend with Tailwind CSS Fix (Force Update)

set -e

echo "🔄 Updating Frontend (Force)..."
echo "==============================="

cd /root/mirzoai/frontend

# 1. Stash or discard local changes
echo "🗑️ Discarding local changes..."
git reset --hard HEAD
git clean -fd

# 2. Pull latest changes
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

# 3. Install/update dependencies
echo "📦 Installing dependencies..."
npm install

# 4. Install Tailwind CSS and PostCSS if not installed
echo "📦 Installing Tailwind CSS and PostCSS..."
npm install -D tailwindcss postcss autoprefixer

# 5. Verify Tailwind config exists
if [ ! -f "tailwind.config.js" ]; then
    echo "⚠️ tailwind.config.js not found, creating..."
    npx tailwindcss init -p
fi

# 6. Build frontend
echo "🏗️ Building frontend..."
npm run build

# 7. Check build result
if [ -f "dist/index.html" ]; then
    echo "✅ Build successful!"
    echo "📁 Build files:"
    ls -lh dist/ | head -10
    
    # Check for CSS files
    echo ""
    echo "📄 CSS files:"
    find dist/assets -name "*.css" 2>/dev/null || echo "No CSS files found in assets"
else
    echo "❌ Build failed!"
    exit 1
fi

# 8. Check if index.css is referenced correctly
echo ""
echo "🔍 Checking index.html..."
if grep -q "index.css" dist/index.html; then
    echo "✅ index.css reference found in index.html"
    # Check if it's a relative path issue
    if grep -q 'href="/index.css"' dist/index.html; then
        echo "⚠️ Absolute path /index.css found - checking if file exists..."
        if [ ! -f "dist/index.css" ]; then
            echo "❌ dist/index.css not found - CSS might be in assets folder"
            echo "💡 This is normal - Vite bundles CSS into assets"
        fi
    fi
fi

# 9. Reload nginx
echo ""
echo "🔄 Reloading Nginx..."
systemctl reload nginx

echo ""
echo "==============================="
echo "🎉 Frontend updated!"
echo "📍 Test: curl https://mirzoai.cdcgroup.uz"
echo ""
echo "💡 Note: If index.css 404 error persists, check browser console for actual CSS file path"
