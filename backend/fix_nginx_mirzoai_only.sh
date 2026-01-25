#!/bin/bash

# Fix Nginx Config for MirzoAI Only (Without Affecting Other Apps)

set -e

echo "🔧 Fixing Nginx Config for MirzoAI..."
echo "====================================="

# 1. Backup existing configs
echo "📦 Backing up existing configs..."
cp /etc/nginx/sites-available/mirzoai-backend /etc/nginx/sites-available/mirzoai-backend.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
cp /etc/nginx/sites-available/mirzoai-frontend /etc/nginx/sites-available/mirzoai-frontend.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

# 2. Create/Update Backend Nginx Config
echo ""
echo "📝 Creating backend Nginx config..."
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
}
EOF

# 3. Create/Update Frontend Nginx Config
echo "📝 Creating frontend Nginx config..."
cat > /etc/nginx/sites-available/mirzoai-frontend << 'EOF'
server {
    listen 80;
    server_name mirzoai.cdcgroup.uz;

    root /root/mirzoai/frontend/dist;
    index index.html;

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

    # Main location
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
}
EOF

# 4. Enable sites
echo "🔗 Enabling sites..."
ln -sf /etc/nginx/sites-available/mirzoai-backend /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/mirzoai-frontend /etc/nginx/sites-enabled/

# 5. Test Nginx configuration
echo ""
echo "🔍 Testing Nginx configuration..."
if nginx -t; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration has errors!"
    exit 1
fi

# 6. Reload Nginx
echo "🔄 Reloading Nginx..."
systemctl reload nginx

# 7. Test HTTP
echo ""
echo "🧪 Testing HTTP connections..."
echo ""
echo "Frontend (http://mirzoai.cdcgroup.uz/):"
FRONTEND_HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://mirzoai.cdcgroup.uz/ || echo "000")
if [ "$FRONTEND_HTTP" = "200" ]; then
    echo "  ✅ HTTP $FRONTEND_HTTP - OK"
else
    echo "  ⚠️  HTTP $FRONTEND_HTTP"
fi

echo ""
echo "Backend API (http://mirzoaiapi.cdcgroup.uz/api/ai/quote/):"
BACKEND_HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://mirzoaiapi.cdcgroup.uz/api/ai/quote/ || echo "000")
if [ "$BACKEND_HTTP" = "200" ]; then
    echo "  ✅ HTTP $BACKEND_HTTP - OK"
else
    echo "  ⚠️  HTTP $BACKEND_HTTP"
fi

# 8. Install SSL certificates
echo ""
echo "🔒 Installing SSL certificates..."
echo ""
echo "--- Frontend SSL ---"
certbot install --cert-name mirzoai.cdcgroup.uz --nginx --redirect 2>&1 | tail -10 || echo "⚠️  Frontend SSL install failed"

echo ""
echo "--- Backend SSL ---"
certbot install --cert-name mirzoaiapi.cdcgroup.uz --nginx --redirect 2>&1 | tail -10 || echo "⚠️  Backend SSL install failed"

# 9. Test Nginx again
echo ""
echo "🔍 Testing Nginx configuration after SSL..."
nginx -t && systemctl reload nginx

# 10. Test HTTPS
echo ""
echo "🧪 Testing HTTPS connections..."
echo ""
echo "Frontend (https://mirzoai.cdcgroup.uz/):"
FRONTEND_HTTPS=$(curl -s -k -o /dev/null -w "%{http_code}" https://mirzoai.cdcgroup.uz/ || echo "000")
if [ "$FRONTEND_HTTPS" = "200" ]; then
    echo "  ✅ HTTP $FRONTEND_HTTPS - OK"
else
    echo "  ⚠️  HTTP $FRONTEND_HTTPS"
fi

echo ""
echo "Backend API (https://mirzoaiapi.cdcgroup.uz/api/ai/quote/):"
BACKEND_HTTPS=$(curl -s -k -o /dev/null -w "%{http_code}" https://mirzoaiapi.cdcgroup.uz/api/ai/quote/ || echo "000")
if [ "$BACKEND_HTTPS" = "200" ]; then
    echo "  ✅ HTTP $BACKEND_HTTPS - OK"
else
    echo "  ⚠️  HTTP $BACKEND_HTTPS"
fi

echo ""
echo "====================================="
echo "🎉 Nginx fix completed!"
echo "====================================="
echo ""
echo "📍 Test URLs:"
echo "   Frontend: https://mirzoai.cdcgroup.uz/"
echo "   Backend: https://mirzoaiapi.cdcgroup.uz/api/ai/quote/"
echo ""
echo "✅ Other applications are not affected"
echo ""
