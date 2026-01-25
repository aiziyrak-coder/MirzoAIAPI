#!/bin/bash

# Fix All Services - Backend and Frontend

set -e

echo "🔧 Fixing All Services..."
echo "=========================="

# 1. Backend
echo ""
echo "📦 Backend..."
cd /root/mirzoai/backend

# Stop backend
systemctl stop mirzoai-backend 2>/dev/null || true
sleep 1

# Kill all gunicorn
pkill -9 gunicorn 2>/dev/null || true
pkill -9 -f "gunicorn.*mirzoai" 2>/dev/null || true
sleep 2

# Kill port 8000
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
fuser -k 8000/tcp 2>/dev/null || true
sleep 2

# Start backend
echo "🚀 Starting backend..."
systemctl start mirzoai-backend
sleep 5

# Check backend
if systemctl is-active --quiet mirzoai-backend; then
    echo "✅ Backend service is RUNNING"
else
    echo "❌ Backend service failed to start"
    journalctl -u mirzoai-backend -n 20 --no-pager | tail -10
    exit 1
fi

# Test backend API
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/api/ai/quote/ || echo "000")
if [ "$API_RESPONSE" = "200" ]; then
    echo "✅ Backend API is responding (HTTP $API_RESPONSE)"
else
    echo "⚠️  Backend API returned HTTP $API_RESPONSE"
fi

# 2. Frontend
echo ""
echo "📦 Frontend..."
cd /root/mirzoai/frontend

# Check if dist exists
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    echo "⚠️  Frontend dist not found or empty. Building..."
    npm run build
    echo "✅ Frontend built"
fi

# Check dist permissions
chmod -R 755 dist 2>/dev/null || true
chown -R root:root dist 2>/dev/null || true

# 3. Nginx
echo ""
echo "📦 Nginx..."
nginx -t
systemctl reload nginx
echo "✅ Nginx reloaded"

# 4. Test Frontend
echo ""
echo "🧪 Testing Frontend..."
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1/ || echo "000")
if [ "$FRONTEND_RESPONSE" = "200" ]; then
    echo "✅ Frontend is responding (HTTP $FRONTEND_RESPONSE)"
else
    echo "⚠️  Frontend returned HTTP $FRONTEND_RESPONSE"
    
    # Check nginx error logs
    echo ""
    echo "📋 Nginx error logs (last 10 lines):"
    tail -10 /var/log/nginx/error.log 2>/dev/null || echo "No error log found"
fi

# 5. Test via domain (if accessible)
echo ""
echo "🧪 Testing Domains..."
echo "Frontend (https://mirzoai.cdcgroup.uz):"
curl -s -k -o /dev/null -w "  HTTP %{http_code}\n" https://mirzoai.cdcgroup.uz/ || echo "  Connection failed"

echo "Backend API (https://mirzoaiapi.cdcgroup.uz/api/ai/quote/):"
curl -s -k -o /dev/null -w "  HTTP %{http_code}\n" https://mirzoaiapi.cdcgroup.uz/api/ai/quote/ || echo "  Connection failed"

# 6. Summary
echo ""
echo "=========================="
echo "📊 Service Status Summary:"
echo "=========================="
echo "Backend Service: $(systemctl is-active mirzoai-backend)"
echo "Nginx Service: $(systemctl is-active nginx)"
echo "Port 8000: $(lsof -i:8000 > /dev/null 2>&1 && echo 'Active' || echo 'Inactive')"
echo "Frontend Dist: $([ -f /root/mirzoai/frontend/dist/index.html ] && echo 'Exists' || echo 'Missing')"
echo ""
echo "=========================="
echo "🎉 All services fixed!"
echo "=========================="
