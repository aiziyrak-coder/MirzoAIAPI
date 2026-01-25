#!/bin/bash

# Check Deployment Status Script

echo "🔍 Checking Deployment Status..."
echo "=================================="

# 1. Check backend service
echo ""
echo "📊 Backend Service Status:"
if systemctl is-active --quiet mirzoai-backend; then
    echo "✅ Backend service is RUNNING"
    systemctl status mirzoai-backend --no-pager -l | head -10
else
    echo "❌ Backend service is NOT RUNNING"
    echo "📋 Last 20 lines of logs:"
    journalctl -u mirzoai-backend -n 20 --no-pager
fi

# 2. Check nginx
echo ""
echo "📊 Nginx Status:"
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx is RUNNING"
    nginx -t
else
    echo "❌ Nginx is NOT RUNNING"
fi

# 3. Check backend process
echo ""
echo "📊 Backend Process:"
if pgrep -f "gunicorn.*mirzoai" > /dev/null; then
    echo "✅ Gunicorn process is running"
    ps aux | grep gunicorn | grep -v grep
else
    echo "❌ Gunicorn process is NOT running"
fi

# 4. Check ports
echo ""
echo "📊 Port Status:"
if netstat -tuln | grep -q ":8000"; then
    echo "✅ Port 8000 is LISTENING"
    netstat -tuln | grep ":8000"
else
    echo "❌ Port 8000 is NOT LISTENING"
fi

# 5. Check directories
echo ""
echo "📊 Directory Status:"
if [ -d "/root/mirzoai/backend" ]; then
    echo "✅ Backend directory exists"
    ls -la /root/mirzoai/backend/ | head -5
else
    echo "❌ Backend directory NOT FOUND"
fi

if [ -d "/root/mirzoai/frontend/dist" ]; then
    echo "✅ Frontend dist directory exists"
    ls -la /root/mirzoai/frontend/dist/ | head -5
else
    echo "❌ Frontend dist directory NOT FOUND"
fi

# 6. Test backend API
echo ""
echo "📊 Testing Backend API:"
response=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/api/ai/quote/ || echo "000")
if [ "$response" = "200" ]; then
    echo "✅ Backend API is responding (HTTP $response)"
    curl -s http://127.0.0.1:8000/api/ai/quote/ | head -3
else
    echo "❌ Backend API is NOT responding (HTTP $response)"
fi

# 7. Check nginx configs
echo ""
echo "📊 Nginx Configuration:"
if [ -f "/etc/nginx/sites-enabled/mirzoai-backend" ]; then
    echo "✅ Backend nginx config exists"
else
    echo "❌ Backend nginx config NOT FOUND"
fi

if [ -f "/etc/nginx/sites-enabled/mirzoai-frontend" ]; then
    echo "✅ Frontend nginx config exists"
else
    echo "❌ Frontend nginx config NOT FOUND"
fi

# 8. Check logs
echo ""
echo "📊 Recent Error Logs:"
echo "--- Backend Errors (last 10 lines) ---"
journalctl -u mirzoai-backend -n 10 --no-pager | grep -i error || echo "No errors found"
echo ""
echo "--- Nginx Errors (last 10 lines) ---"
tail -10 /var/log/nginx/error.log 2>/dev/null || echo "No nginx error log found"

echo ""
echo "=================================="
echo "✅ Status check completed!"
