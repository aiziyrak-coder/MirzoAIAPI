#!/bin/bash

# Fix SSL Certificates for Both Domains

set -e

echo "🔒 Fixing SSL Certificates..."
echo "=============================="

# 1. Test current certificates
echo ""
echo "🔍 Checking current certificates..."
echo "Frontend (mirzoai.cdcgroup.uz):"
openssl s_client -connect mirzoai.cdcgroup.uz:443 -servername mirzoai.cdcgroup.uz </dev/null 2>/dev/null | grep "subject=" || echo "  Certificate check failed"

echo ""
echo "Backend (mirzoaiapi.cdcgroup.uz):"
openssl s_client -connect mirzoaiapi.cdcgroup.uz:443 -servername mirzoaiapi.cdcgroup.uz </dev/null 2>/dev/null | grep "subject=" || echo "  Certificate check failed"

# 2. Ensure HTTP is configured for Certbot
echo ""
echo "🔧 Ensuring HTTP configuration for Certbot..."
# This will be handled by certbot --nginx

# 3. Get/renew certificates
echo ""
echo "📜 Getting/Renewing SSL certificates..."

# Frontend
echo ""
echo "--- Frontend SSL (mirzoai.cdcgroup.uz) ---"
certbot --nginx \
    -d mirzoai.cdcgroup.uz \
    --non-interactive \
    --agree-tos \
    --email admin@cdcgroup.uz \
    --redirect \
    --force-renewal \
    2>&1 | tail -20 || echo "⚠️  Frontend SSL renewal failed (may already exist)"

# Backend
echo ""
echo "--- Backend SSL (mirzoaiapi.cdcgroup.uz) ---"
certbot --nginx \
    -d mirzoaiapi.cdcgroup.uz \
    --non-interactive \
    --agree-tos \
    --email admin@cdcgroup.uz \
    --redirect \
    --force-renewal \
    2>&1 | tail -20 || echo "⚠️  Backend SSL renewal failed (may already exist)"

# 4. Test Nginx configuration
echo ""
echo "🔍 Testing Nginx configuration..."
nginx -t

# 5. Reload Nginx
echo ""
echo "🔄 Reloading Nginx..."
systemctl reload nginx

# 6. Test HTTPS
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
echo "=============================="
echo "🎉 SSL fix completed!"
echo "=============================="
echo ""
echo "📍 Test URLs:"
echo "   Frontend: https://mirzoai.cdcgroup.uz/"
echo "   Backend: https://mirzoaiapi.cdcgroup.uz/api/ai/quote/"
echo ""
