#!/bin/bash

# Restart All Services

set -e

echo "🔄 Restarting All Services..."
echo "=============================="

# 1. Backend Service
echo ""
echo "🔄 Restarting Backend Service..."
systemctl restart mirzoai-backend
sleep 3
echo "✅ Backend service restarted"

# 2. Check Backend Status
echo ""
echo "📊 Checking Backend Status..."
systemctl status mirzoai-backend --no-pager -l | head -20

# 3. Check Backend Port
echo ""
echo "🔍 Checking Port 8000..."
if lsof -i:8000 > /dev/null 2>&1; then
    echo "✅ Port 8000 is active"
    lsof -i:8000 | head -5
else
    echo "⚠️  Port 8000 is not active"
fi

# 4. Test Backend API
echo ""
echo "🧪 Testing Backend API..."
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/api/ai/quote/ || echo "000")
if [ "$API_RESPONSE" = "200" ]; then
    echo "✅ Backend API is responding (HTTP $API_RESPONSE)"
else
    echo "⚠️  Backend API returned HTTP $API_RESPONSE"
fi

# 5. Nginx Service
echo ""
echo "🔄 Testing and Reloading Nginx..."
nginx -t && systemctl reload nginx
echo "✅ Nginx reloaded"

# 6. Check Nginx Status
echo ""
echo "📊 Checking Nginx Status..."
systemctl status nginx --no-pager -l | head -15

# 7. Test Frontend
echo ""
echo "🧪 Testing Frontend..."
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1/ || echo "000")
if [ "$FRONTEND_RESPONSE" = "200" ]; then
    echo "✅ Frontend is responding (HTTP $FRONTEND_RESPONSE)"
else
    echo "⚠️  Frontend returned HTTP $FRONTEND_RESPONSE"
fi

# 8. Summary
echo ""
echo "=============================="
echo "📋 Service Status Summary:"
echo "=============================="
echo "Backend Service: $(systemctl is-active mirzoai-backend)"
echo "Nginx Service: $(systemctl is-active nginx)"
echo "Port 8000: $(lsof -i:8000 > /dev/null 2>&1 && echo 'Active' || echo 'Inactive')"
echo ""
echo "📍 Test URLs:"
echo "   Backend: curl http://127.0.0.1:8000/api/ai/quote/"
echo "   Frontend: curl http://mirzoai.cdcgroup.uz/"
echo "   Backend API: curl https://mirzoaiapi.cdcgroup.uz/api/ai/quote/"
echo ""
echo "🎉 All services restarted!"
