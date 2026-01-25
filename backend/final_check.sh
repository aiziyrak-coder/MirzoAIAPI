#!/bin/bash

# Final Deployment Check and SSL Setup

set -e

echo "🔍 Final Deployment Check..."
echo "============================"

# 1. Check Backend
echo ""
echo "📊 Backend Status:"
if systemctl is-active --quiet mirzoai-backend; then
    echo "✅ Backend service is RUNNING"
    systemctl status mirzoai-backend --no-pager -l | head -10
else
    echo "❌ Backend service is NOT running"
fi

# 2. Test Backend API
echo ""
echo "🧪 Testing Backend API:"
response=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/api/ai/quote/ || echo "000")
if [ "$response" = "200" ]; then
    echo "✅ Backend API is working! (HTTP $response)"
    curl -s http://127.0.0.1:8000/api/ai/quote/ | head -1
else
    echo "❌ Backend API not responding (HTTP $response)"
fi

# 3. Test Backend via Domain
echo ""
echo "🧪 Testing Backend via Domain:"
response=$(curl -s -o /dev/null -w "%{http_code}" http://mirzoaiapi.cdcgroup.uz/api/ai/quote/ || echo "000")
if [ "$response" = "200" ]; then
    echo "✅ Backend domain is working! (HTTP $response)"
else
    echo "⚠️ Backend domain not responding (HTTP $response)"
fi

# 4. Check Frontend
echo ""
echo "📊 Frontend Status:"
if [ -f "/root/mirzoai/frontend/dist/index.html" ]; then
    echo "✅ Frontend dist exists"
    ls -lh /root/mirzoai/frontend/dist/index.html
else
    echo "❌ Frontend dist NOT found"
fi

# 5. Test Frontend
echo ""
echo "🧪 Testing Frontend:"
response=$(curl -s -o /dev/null -w "%{http_code}" http://mirzoai.cdcgroup.uz || echo "000")
if [ "$response" = "200" ]; then
    echo "✅ Frontend is working! (HTTP $response)"
    curl -s http://mirzoai.cdcgroup.uz | grep -o "<title>.*</title>" | head -1
else
    echo "⚠️ Frontend not responding (HTTP $response)"
fi

# 6. Check Nginx
echo ""
echo "📊 Nginx Status:"
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx is RUNNING"
    nginx -t
else
    echo "❌ Nginx is NOT running"
fi

# 7. Check SSL
echo ""
echo "📊 SSL Status:"
if [ -f "/etc/letsencrypt/live/mirzoaiapi.cdcgroup.uz/fullchain.pem" ]; then
    echo "✅ Backend SSL certificate exists"
else
    echo "⚠️ Backend SSL certificate NOT found"
fi

if [ -f "/etc/letsencrypt/live/mirzoai.cdcgroup.uz/fullchain.pem" ]; then
    echo "✅ Frontend SSL certificate exists"
else
    echo "⚠️ Frontend SSL certificate NOT found"
fi

# 8. Setup SSL if not exists
echo ""
echo "🔒 Setting up SSL certificates..."
if ! command -v certbot &> /dev/null; then
    echo "📥 Installing Certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
fi

# Backend SSL
if [ ! -f "/etc/letsencrypt/live/mirzoaiapi.cdcgroup.uz/fullchain.pem" ]; then
    echo "📜 Getting SSL certificate for backend..."
    certbot --nginx -d mirzoaiapi.cdcgroup.uz --non-interactive --agree-tos --email admin@cdcgroup.uz --redirect || echo "SSL setup failed for backend"
fi

# Frontend SSL
if [ ! -f "/etc/letsencrypt/live/mirzoai.cdcgroup.uz/fullchain.pem" ]; then
    echo "📜 Getting SSL certificate for frontend..."
    certbot --nginx -d mirzoai.cdcgroup.uz --non-interactive --agree-tos --email admin@cdcgroup.uz --redirect || echo "SSL setup failed for frontend"
fi

# 9. Final Test with HTTPS
echo ""
echo "🧪 Final HTTPS Tests:"
echo "--- Backend HTTPS ---"
response=$(curl -s -o /dev/null -w "%{http_code}" https://mirzoaiapi.cdcgroup.uz/api/ai/quote/ || echo "000")
if [ "$response" = "200" ]; then
    echo "✅ Backend HTTPS is working! (HTTP $response)"
else
    echo "⚠️ Backend HTTPS not working (HTTP $response)"
fi

echo "--- Frontend HTTPS ---"
response=$(curl -s -o /dev/null -w "%{http_code}" https://mirzoai.cdcgroup.uz || echo "000")
if [ "$response" = "200" ]; then
    echo "✅ Frontend HTTPS is working! (HTTP $response)"
else
    echo "⚠️ Frontend HTTPS not working (HTTP $response)"
fi

echo ""
echo "============================"
echo "🎉 Final check completed!"
echo ""
echo "📍 Backend: https://mirzoaiapi.cdcgroup.uz"
echo "📍 Frontend: https://mirzoai.cdcgroup.uz"
echo ""
echo "✅ Deployment is complete!"
