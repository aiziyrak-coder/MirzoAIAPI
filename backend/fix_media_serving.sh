#!/bin/bash

# Fix Media File Serving in Nginx

set -e

echo "🔧 Fixing Media File Serving..."
echo "================================"

# Backend Nginx config (try different possible names)
BACKEND_NGINX=""
if [ -f "/etc/nginx/sites-available/mirzoai-backend" ]; then
    BACKEND_NGINX="/etc/nginx/sites-available/mirzoai-backend"
elif [ -f "/etc/nginx/sites-available/mirzoaiapi.cdcgroup.uz" ]; then
    BACKEND_NGINX="/etc/nginx/sites-available/mirzoaiapi.cdcgroup.uz"
else
    # Find any nginx config that might be for backend
    BACKEND_NGINX=$(ls /etc/nginx/sites-available/*backend* 2>/dev/null | head -1)
fi

if [ -f "$BACKEND_NGINX" ]; then
    echo "📝 Updating backend Nginx config..."
    
    # Check if media location already exists
    if ! grep -q "location /media/" "$BACKEND_NGINX"; then
        # Add media location before the closing brace
        sed -i '/location \/api\/ {/a\
    # Serve media files\
    location /media/ {\
        alias /root/mirzoai/backend/media/;\
        expires 30d;\
        add_header Cache-Control "public, immutable";\
    }
' "$BACKEND_NGINX"
        echo "✅ Media location added to backend config"
    else
        echo "ℹ️  Media location already exists in backend config"
    fi
    
    # Test and reload
    nginx -t && systemctl reload nginx
    echo "✅ Nginx reloaded"
else
    echo "⚠️  Backend Nginx config not found: $BACKEND_NGINX"
fi

# Check media directory permissions
MEDIA_DIR="/root/mirzoai/backend/media"
if [ -d "$MEDIA_DIR" ]; then
    echo "📁 Checking media directory permissions..."
    chmod -R 755 "$MEDIA_DIR"
    chown -R root:root "$MEDIA_DIR"
    echo "✅ Media directory permissions fixed"
else
    echo "📁 Creating media directory..."
    mkdir -p "$MEDIA_DIR/receipts"
    chmod -R 755 "$MEDIA_DIR"
    chown -R root:root "$MEDIA_DIR"
    echo "✅ Media directory created"
fi

echo ""
echo "================================"
echo "🎉 Media serving fixed!"
echo "📍 Media files should now be accessible at: https://mirzoaiapi.cdcgroup.uz/media/"
