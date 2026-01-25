#!/bin/bash

# Fix SSL Certificates for Correct Domains

set -e

echo "🔒 Fixing SSL Certificates..."
echo "=============================="

# 1. Check current SSL certificates
echo ""
echo "📊 Checking Current SSL Certificates:"
if [ -d "/etc/letsencrypt/live/mirzoaiapi.cdcgroup.uz" ]; then
    echo "✅ Backend SSL directory exists"
    ls -la /etc/letsencrypt/live/mirzoaiapi.cdcgroup.uz/ 2>/dev/null | head -5
else
    echo "❌ Backend SSL directory NOT found"
fi

if [ -d "/etc/letsencrypt/live/mirzoai.cdcgroup.uz" ]; then
    echo "✅ Frontend SSL directory exists"
    ls -la /etc/letsencrypt/live/mirzoai.cdcgroup.uz/ 2>/dev/null | head -5
else
    echo "❌ Frontend SSL directory NOT found"
fi

# 2. Check nginx SSL configuration
echo ""
echo "📊 Checking Nginx SSL Configuration:"
grep -r "ssl_certificate" /etc/nginx/sites-enabled/ | grep -v "#" || echo "No SSL certificates configured"

# 3. Revoke old certificates if they exist for wrong domains
echo ""
echo "🔍 Checking for wrong domain certificates..."
certbot certificates 2>/dev/null | grep -E "mirzoaiapi|mirzoai" || echo "No certificates found for these domains"

# 4. Delete old certificates and get new ones
echo ""
echo "🗑️ Removing old certificates (if any)..."
certbot delete --cert-name mirzoaiapi.cdcgroup.uz --non-interactive 2>/dev/null || echo "No old backend certificate to delete"
certbot delete --cert-name mirzoai.cdcgroup.uz --non-interactive 2>/dev/null || echo "No old frontend certificate to delete"

# 5. Ensure nginx configs are correct for HTTP first
echo ""
echo "🔧 Ensuring Nginx configs are correct for HTTP..."
cat > /etc/nginx/sites-available/mirzoai-backend << 'EOF'
server {
    listen 80;
    server_name mirzoaiapi.cdcgroup.uz;

    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }

    location /static/ {
        alias /root/mirzoai/backend/static/;
        expires 30d;
        access_log off;
    }

    location /media/ {
        alias /root/mirzoai/backend/media/;
        expires 7d;
        access_log off;
    }
}
EOF

cat > /etc/nginx/sites-available/mirzoai-frontend << 'EOF'
server {
    listen 80;
    server_name mirzoai.cdcgroup.uz;

    root /root/mirzoai/frontend/dist;
    index index.html;

    client_max_body_size 20M;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
}
EOF

ln -sf /etc/nginx/sites-available/mirzoai-backend /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/mirzoai-frontend /etc/nginx/sites-enabled/

# 6. Test and reload nginx
echo ""
echo "🔄 Testing and reloading Nginx..."
nginx -t
systemctl reload nginx

# 7. Get new SSL certificates
echo ""
echo "📜 Getting new SSL certificates..."
echo "--- Backend SSL ---"
certbot --nginx -d mirzoaiapi.cdcgroup.uz \
    --non-interactive \
    --agree-tos \
    --email admin@cdcgroup.uz \
    --redirect \
    --force-renewal \
    || echo "⚠️ Failed to get backend SSL certificate"

echo ""
echo "--- Frontend SSL ---"
certbot --nginx -d mirzoai.cdcgroup.uz \
    --non-interactive \
    --agree-tos \
    --email admin@cdcgroup.uz \
    --redirect \
    --force-renewal \
    || echo "⚠️ Failed to get frontend SSL certificate"

# 8. Test HTTPS
echo ""
echo "🧪 Testing HTTPS..."
sleep 2

echo "--- Backend HTTPS ---"
response=$(curl -s -k -o /dev/null -w "%{http_code}" https://mirzoaiapi.cdcgroup.uz/api/ai/quote/ 2>/dev/null || echo "000")
if [ "$response" = "200" ]; then
    echo "✅ Backend HTTPS is working! (HTTP $response)"
    curl -s -k https://mirzoaiapi.cdcgroup.uz/api/ai/quote/ | head -1
else
    echo "⚠️ Backend HTTPS not working (HTTP $response)"
    echo "💡 Try: curl -k https://mirzoaiapi.cdcgroup.uz/api/ai/quote/"
fi

echo ""
echo "--- Frontend HTTPS ---"
response=$(curl -s -k -o /dev/null -w "%{http_code}" https://mirzoai.cdcgroup.uz 2>/dev/null || echo "000")
if [ "$response" = "200" ]; then
    echo "✅ Frontend HTTPS is working! (HTTP $response)"
    curl -s -k https://mirzoai.cdcgroup.uz | grep -o "<title>.*</title>" | head -1
else
    echo "⚠️ Frontend HTTPS not working (HTTP $response)"
    echo "💡 Try: curl -k https://mirzoai.cdcgroup.uz"
fi

echo ""
echo "=============================="
echo "🎉 SSL Fix Completed!"
echo ""
echo "📍 Backend: https://mirzoaiapi.cdcgroup.uz"
echo "📍 Frontend: https://mirzoai.cdcgroup.uz"
echo ""
echo "✅ If certificates are correct, they should work in browsers!"
