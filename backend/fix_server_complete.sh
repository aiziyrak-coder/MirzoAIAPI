#!/bin/bash

# Complete Server Fix and Restart

set -e

echo "🔧 Complete Server Fix and Restart..."
echo "======================================"

# 1. Backend
echo ""
echo "📦 Backend..."
cd /root/mirzoai/backend

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "⚠️  Virtual environment not found. Creating..."
    python3 -m venv venv
fi

source venv/bin/activate

# Check backend service
echo "🔄 Checking backend service..."
if systemctl is-active --quiet mirzoai-backend; then
    echo "✅ Backend service is running"
else
    echo "⚠️  Backend service is not running. Starting..."
    systemctl start mirzoai-backend
fi

# Kill any processes on port 8000
echo "🔍 Checking port 8000..."
if lsof -i:8000 > /dev/null 2>&1; then
    echo "⚠️  Port 8000 is in use. Killing processes..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Restart backend
echo "🔄 Restarting backend service..."
systemctl restart mirzoai-backend
sleep 3

# 2. Frontend
echo ""
echo "📦 Frontend..."
cd /root/mirzoai/frontend

# Check if dist exists
if [ ! -d "dist" ]; then
    echo "⚠️  Frontend dist not found. Building..."
    npm run build
fi

# 3. Nginx
echo ""
echo "📦 Nginx..."
echo "🔄 Testing Nginx configuration..."
nginx -t

echo "🔄 Reloading Nginx..."
systemctl reload nginx

# 4. Fix permissions
echo ""
echo "📁 Fixing permissions..."
chown -R root:root /root/mirzoai
chmod -R 755 /root/mirzoai
chmod -R 755 /root/mirzoai/backend/media 2>/dev/null || true
chmod -R 755 /root/mirzoai/frontend/dist 2>/dev/null || true

# 5. Status Check
echo ""
echo "=============================="
echo "📊 Service Status:"
echo "=============================="

# Backend
echo ""
echo "🔵 Backend Service:"
if systemctl is-active --quiet mirzoai-backend; then
    echo "   ✅ Status: RUNNING"
    systemctl status mirzoai-backend --no-pager -l | head -10 | tail -5
else
    echo "   ❌ Status: NOT RUNNING"
    echo "   📋 Last logs:"
    journalctl -u mirzoai-backend -n 10 --no-pager | tail -5
fi

# Port 8000
echo ""
echo "🔵 Port 8000:"
if lsof -i:8000 > /dev/null 2>&1; then
    echo "   ✅ Status: LISTENING"
    lsof -i:8000 | head -3
else
    echo "   ❌ Status: NOT LISTENING"
fi

# Nginx
echo ""
echo "🔵 Nginx Service:"
if systemctl is-active --quiet nginx; then
    echo "   ✅ Status: RUNNING"
    systemctl status nginx --no-pager -l | head -8 | tail -5
else
    echo "   ❌ Status: NOT RUNNING"
fi

# 6. Test APIs
echo ""
echo "=============================="
echo "🧪 Testing Endpoints:"
echo "=============================="

# Backend direct
echo ""
echo "🔵 Backend (127.0.0.1:8000):"
BACKEND_DIRECT=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/api/ai/quote/ || echo "000")
if [ "$BACKEND_DIRECT" = "200" ]; then
    echo "   ✅ HTTP $BACKEND_DIRECT - OK"
else
    echo "   ❌ HTTP $BACKEND_DIRECT - FAILED"
fi

# Backend via domain
echo ""
echo "🔵 Backend API (https://mirzoaiapi.cdcgroup.uz):"
BACKEND_DOMAIN=$(curl -s -k -o /dev/null -w "%{http_code}" https://mirzoaiapi.cdcgroup.uz/api/ai/quote/ || echo "000")
if [ "$BACKEND_DOMAIN" = "200" ]; then
    echo "   ✅ HTTP $BACKEND_DOMAIN - OK"
else
    echo "   ⚠️  HTTP $BACKEND_DOMAIN - Check SSL or DNS"
fi

# Frontend
echo ""
echo "🔵 Frontend (https://mirzoai.cdcgroup.uz):"
FRONTEND_DOMAIN=$(curl -s -k -o /dev/null -w "%{http_code}" https://mirzoai.cdcgroup.uz/ || echo "000")
if [ "$FRONTEND_DOMAIN" = "200" ]; then
    echo "   ✅ HTTP $FRONTEND_DOMAIN - OK"
else
    echo "   ⚠️  HTTP $FRONTEND_DOMAIN - Check SSL or DNS"
fi

# 7. Check logs if there are issues
echo ""
echo "=============================="
if [ "$BACKEND_DIRECT" != "200" ]; then
    echo "📋 Backend Error Logs (last 20 lines):"
    journalctl -u mirzoai-backend -n 20 --no-pager | tail -10
fi

# 8. Summary
echo ""
echo "=============================="
echo "🎉 Server Fix Completed!"
echo "=============================="
echo ""
echo "📍 Test URLs:"
echo "   Frontend: https://mirzoai.cdcgroup.uz/"
echo "   Backend API: https://mirzoaiapi.cdcgroup.uz/api/ai/quote/"
echo ""
echo "📍 If services are not running, check logs:"
echo "   journalctl -u mirzoai-backend -n 50"
echo "   journalctl -u nginx -n 50"
echo ""
