#!/bin/bash

# Fix Deployment Issues Script
# Fixes 500 and 403 errors

set -e

echo "🔧 Fixing deployment issues..."

# 1. Check and fix permissions
echo "📁 Fixing permissions..."
chown -R root:root /root/mirzoai
chmod -R 755 /root/mirzoai
chmod -R 755 /root/mirzoai/backend
chmod -R 755 /root/mirzoai/frontend

# 2. Check backend service
echo "🔍 Checking backend service..."
if systemctl is-active --quiet mirzoai-backend; then
    echo "✅ Backend service is running"
else
    echo "❌ Backend service is not running. Starting..."
    systemctl start mirzoai-backend
fi

# 3. Check nginx configuration
echo "🔍 Checking nginx configuration..."
nginx -t

# 4. Fix frontend nginx config
echo "🔧 Fixing frontend nginx configuration..."
cat > /etc/nginx/sites-available/mirzoai-frontend << 'EOF'
server {
    listen 80;
    server_name mirzoai.cdcgroup.uz;

    root /root/mirzoai/frontend/dist;
    index index.html;

    # Fix permissions
    client_max_body_size 20M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Main location - fix try_files
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    # API proxy (if needed)
    location /api {
        proxy_pass https://mirzoaiapi.cdcgroup.uz;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Fix favicon
    location = /favicon.ico {
        log_not_found off;
        access_log off;
    }

    # Fix robots.txt
    location = /robots.txt {
        log_not_found off;
        access_log off;
    }
}
EOF

# 5. Fix backend nginx config
echo "🔧 Fixing backend nginx configuration..."
cat > /etc/nginx/sites-available/mirzoai-backend << 'EOF'
server {
    listen 80;
    server_name mirzoaiapi.cdcgroup.uz;

    client_max_body_size 20M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # API location
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }

    # Static files
    location /static/ {
        alias /root/mirzoai/backend/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Media files
    location /media/ {
        alias /root/mirzoai/backend/media/;
        expires 7d;
        add_header Cache-Control "public";
        access_log off;
    }

    # Fix favicon
    location = /favicon.ico {
        log_not_found off;
        access_log off;
    }
}
EOF

# 6. Enable sites
ln -sf /etc/nginx/sites-available/mirzoai-backend /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/mirzoai-frontend /etc/nginx/sites-enabled/

# 7. Remove default site if exists
if [ -f /etc/nginx/sites-enabled/default ]; then
    rm /etc/nginx/sites-enabled/default
fi

# 8. Test and reload nginx
echo "🔄 Testing and reloading nginx..."
nginx -t
systemctl reload nginx

# 9. Restart backend
echo "🔄 Restarting backend..."
systemctl restart mirzoai-backend

# 10. Check status
echo "✅ Checking services status..."
systemctl status mirzoai-backend --no-pager -l | head -20
systemctl status nginx --no-pager -l | head -20

echo ""
echo "🎉 Fix completed!"
echo "📍 Test: curl http://mirzoai.cdcgroup.uz"
echo "📍 Test API: curl http://mirzoaiapi.cdcgroup.uz/api/ai/quote/"
