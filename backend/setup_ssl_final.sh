#!/bin/bash

# Final SSL Setup for Mirzo AI

set -e

echo "🔒 Setting up SSL Certificates..."
echo "=================================="

# 1. Install certbot if not installed
if ! command -v certbot &> /dev/null; then
    echo "📥 Installing Certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
fi

# 2. Setup SSL for Backend
echo ""
echo "📜 Setting up SSL for Backend (mirzoaiapi.cdcgroup.uz)..."
if [ -f "/etc/letsencrypt/live/mirzoaiapi.cdcgroup.uz/fullchain.pem" ]; then
    echo "✅ Backend SSL certificate already exists"
else
    certbot --nginx -d mirzoaiapi.cdcgroup.uz \
        --non-interactive \
        --agree-tos \
        --email admin@cdcgroup.uz \
        --redirect \
        || echo "⚠️ SSL setup failed for backend (may need DNS verification)"
fi

# 3. Setup SSL for Frontend
echo ""
echo "📜 Setting up SSL for Frontend (mirzoai.cdcgroup.uz)..."
if [ -f "/etc/letsencrypt/live/mirzoai.cdcgroup.uz/fullchain.pem" ]; then
    echo "✅ Frontend SSL certificate already exists"
else
    certbot --nginx -d mirzoai.cdcgroup.uz \
        --non-interactive \
        --agree-tos \
        --email admin@cdcgroup.uz \
        --redirect \
        || echo "⚠️ SSL setup failed for frontend (may need DNS verification)"
fi

# 4. Setup auto-renewal
echo ""
echo "🔄 Setting up SSL auto-renewal..."
systemctl enable certbot.timer
systemctl start certbot.timer

# 5. Test HTTPS
echo ""
echo "🧪 Testing HTTPS..."
echo "--- Backend HTTPS ---"
response=$(curl -s -o /dev/null -w "%{http_code}" https://mirzoaiapi.cdcgroup.uz/api/ai/quote/ || echo "000")
if [ "$response" = "200" ]; then
    echo "✅ Backend HTTPS is working! (HTTP $response)"
    curl -s https://mirzoaiapi.cdcgroup.uz/api/ai/quote/ | head -1
else
    echo "⚠️ Backend HTTPS not working (HTTP $response) - may need DNS or firewall configuration"
fi

echo ""
echo "--- Frontend HTTPS ---"
response=$(curl -s -o /dev/null -w "%{http_code}" https://mirzoai.cdcgroup.uz || echo "000")
if [ "$response" = "200" ]; then
    echo "✅ Frontend HTTPS is working! (HTTP $response)"
    curl -s https://mirzoai.cdcgroup.uz | grep -o "<title>.*</title>" | head -1
else
    echo "⚠️ Frontend HTTPS not working (HTTP $response) - may need DNS or firewall configuration"
fi

echo ""
echo "=================================="
echo "🎉 SSL Setup Completed!"
echo ""
echo "📍 Backend: https://mirzoaiapi.cdcgroup.uz"
echo "📍 Frontend: https://mirzoai.cdcgroup.uz"
echo ""
echo "✅ Deployment is complete!"
