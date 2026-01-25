#!/bin/bash

# Fix Backend Crash - Clean Port 8000 and Restart

set -e

echo "🔧 Fixing Backend Crash..."
echo "==========================="

# 1. Stop backend service
echo "🛑 Stopping backend service..."
systemctl stop mirzoai-backend 2>/dev/null || true
sleep 2

# 2. Kill all gunicorn processes
echo "🔄 Killing all gunicorn processes..."
pkill -9 gunicorn 2>/dev/null || true
sleep 2

# 3. Kill processes on port 8000
echo "🔍 Finding and killing processes on port 8000..."
if lsof -i:8000 > /dev/null 2>&1; then
    echo "⚠️  Found processes on port 8000:"
    lsof -i:8000
    
    echo "🛑 Killing processes..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    sleep 2
    
    # Double check
    if lsof -i:8000 > /dev/null 2>&1; then
        echo "⚠️  Still processes on port 8000, force killing..."
        fuser -k 8000/tcp 2>/dev/null || true
        sleep 2
    fi
fi

# 4. Verify port is free
echo "✅ Verifying port 8000 is free..."
if lsof -i:8000 > /dev/null 2>&1; then
    echo "❌ Port 8000 is still in use!"
    echo "📋 Current processes:"
    lsof -i:8000
    exit 1
else
    echo "✅ Port 8000 is free"
fi

# 5. Clean up any remaining processes
echo "🧹 Cleaning up..."
pkill -9 -f "gunicorn.*mirzoai" 2>/dev/null || true
sleep 1

# 6. Start backend service
echo "🚀 Starting backend service..."
systemctl start mirzoai-backend
sleep 5

# 7. Check status
echo ""
echo "📊 Checking backend status..."
if systemctl is-active --quiet mirzoai-backend; then
    echo "✅ Backend service is RUNNING"
    systemctl status mirzoai-backend --no-pager -l | head -15
else
    echo "❌ Backend service is NOT running"
    echo "📋 Last logs:"
    journalctl -u mirzoai-backend -n 20 --no-pager | tail -10
    exit 1
fi

# 8. Check port 8000
echo ""
echo "🔍 Checking port 8000..."
if lsof -i:8000 > /dev/null 2>&1; then
    echo "✅ Port 8000 is LISTENING"
    lsof -i:8000 | head -5
else
    echo "❌ Port 8000 is NOT listening"
    exit 1
fi

# 9. Test API
echo ""
echo "🧪 Testing backend API..."
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/api/ai/quote/ || echo "000")
if [ "$API_RESPONSE" = "200" ]; then
    echo "✅ Backend API is responding (HTTP $API_RESPONSE)"
    curl -s http://127.0.0.1:8000/api/ai/quote/ | head -c 100
    echo "..."
else
    echo "⚠️  Backend API returned HTTP $API_RESPONSE"
fi

echo ""
echo "==========================="
echo "🎉 Backend fix completed!"
echo "==========================="
