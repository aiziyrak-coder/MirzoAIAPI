#!/bin/bash

# Fix 502 Bad Gateway Error

set -e

echo "🔧 Fixing 502 Bad Gateway Error..."
echo "==================================="

# 1. Check backend service
echo ""
echo "📊 Checking Backend Service:"
if systemctl is-active --quiet mirzoai-backend; then
    echo "✅ Backend service is running"
    systemctl status mirzoai-backend --no-pager -l | head -10
else
    echo "❌ Backend service is NOT running"
    echo "🚀 Starting backend service..."
    systemctl start mirzoai-backend
    sleep 3
fi

# 2. Check if backend is listening on port 8000
echo ""
echo "📊 Checking Port 8000:"
if lsof -i:8000 >/dev/null 2>&1 || ss -tlnp | grep -q ':8000'; then
    echo "✅ Port 8000 is listening"
    lsof -i:8000 2>/dev/null || ss -tlnp | grep ':8000'
else
    echo "❌ Port 8000 is NOT listening"
    echo "🔄 Restarting backend..."
    systemctl restart mirzoai-backend
    sleep 3
fi

# 3. Test backend directly
echo ""
echo "🧪 Testing Backend Directly:"
response=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/api/ai/quote/ || echo "000")
if [ "$response" = "200" ]; then
    echo "✅ Backend is responding! (HTTP $response)"
    curl -s http://127.0.0.1:8000/api/ai/quote/ | head -1
else
    echo "❌ Backend is NOT responding (HTTP $response)"
    echo "📋 Checking backend error logs..."
    tail -30 /var/log/mirzoai-backend-error.log 2>/dev/null || echo "No error log"
    echo ""
    echo "📋 Checking backend access logs..."
    tail -10 /var/log/mirzoai-backend-access.log 2>/dev/null || echo "No access log"
fi

# 4. Check nginx configuration
echo ""
echo "📊 Checking Nginx Configuration:"
nginx -t

# 5. Fix backend nginx config
echo ""
echo "🔧 Fixing Backend Nginx Configuration..."
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
        
        # Buffer settings
        proxy_buffering off;
        proxy_request_buffering off;
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

# 6. Enable site
ln -sf /etc/nginx/sites-available/mirzoai-backend /etc/nginx/sites-enabled/

# 7. Test and reload nginx
echo ""
echo "🔄 Testing and reloading Nginx..."
nginx -t
systemctl reload nginx

# 8. Wait a moment
sleep 2

# 9. Test via nginx
echo ""
echo "🧪 Testing via Nginx:"
response=$(curl -s -o /dev/null -w "%{http_code}" http://mirzoaiapi.cdcgroup.uz/api/ai/quote/ || echo "000")
if [ "$response" = "200" ]; then
    echo "✅ Nginx proxy is working! (HTTP $response)"
    curl -s http://mirzoaiapi.cdcgroup.uz/api/ai/quote/ | head -1
else
    echo "❌ Nginx proxy still not working (HTTP $response)"
    echo "📋 Checking nginx error logs..."
    tail -20 /var/log/nginx/error.log
fi

# 10. Check nginx error log
echo ""
echo "📋 Recent Nginx Errors:"
tail -10 /var/log/nginx/error.log | grep -i "502\|bad gateway\|upstream" || echo "No 502 errors in recent logs"

echo ""
echo "==================================="
echo "🎉 502 Fix completed!"
echo ""
echo "📍 Test: curl http://mirzoaiapi.cdcgroup.uz/api/ai/quote/"
