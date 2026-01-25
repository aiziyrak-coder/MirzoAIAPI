#!/bin/bash

# Fix Port 8000 Already in Use Issue

set -e

echo "🔧 Fixing Port 8000 issue..."

# 1. Find process using port 8000
echo "🔍 Finding process using port 8000..."
PID=$(lsof -ti:8000 2>/dev/null || fuser 8000/tcp 2>/dev/null | awk '{print $1}' || echo "")

if [ -z "$PID" ]; then
    # Try with ss command
    PID=$(ss -tlnp | grep ':8000' | awk '{print $6}' | cut -d',' -f2 | cut -d'=' -f2 | head -1)
fi

if [ ! -z "$PID" ]; then
    echo "⚠️ Found process using port 8000: PID $PID"
    echo "Process info:"
    ps aux | grep $PID | grep -v grep || true
    
    # Kill the process
    echo "🛑 Killing process $PID..."
    kill -9 $PID 2>/dev/null || true
    sleep 2
    echo "✅ Process killed"
else
    echo "ℹ️ No process found using port 8000 (might be stale socket)"
    # Try to kill any gunicorn processes
    pkill -9 gunicorn 2>/dev/null || true
    sleep 2
fi

# 2. Stop backend service
echo "🛑 Stopping backend service..."
systemctl stop mirzoai-backend 2>/dev/null || true
sleep 2

# 3. Verify port is free
echo "🔍 Verifying port 8000 is free..."
if lsof -ti:8000 >/dev/null 2>&1 || fuser 8000/tcp >/dev/null 2>&1; then
    echo "⚠️ Port 8000 still in use, trying to free it..."
    # More aggressive kill
    fuser -k 8000/tcp 2>/dev/null || true
    sleep 2
else
    echo "✅ Port 8000 is free"
fi

# 4. Clean up any stale gunicorn processes
echo "🧹 Cleaning up stale processes..."
pkill -9 gunicorn 2>/dev/null || true
pkill -9 python3 2>/dev/null || true
sleep 2

# 5. Start backend service
echo "🚀 Starting backend service..."
systemctl start mirzoai-backend
sleep 3

# 6. Check status
echo "✅ Checking backend status..."
systemctl status mirzoai-backend --no-pager -l | head -15

# 7. Test API
echo ""
echo "🧪 Testing backend API..."
sleep 2
response=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/api/ai/quote/ || echo "000")
if [ "$response" = "200" ]; then
    echo "✅ Backend API is working! (HTTP $response)"
    curl -s http://127.0.0.1:8000/api/ai/quote/ | head -3
else
    echo "❌ Backend API not responding (HTTP $response)"
    echo "📋 Checking error logs..."
    tail -20 /var/log/mirzoai-backend-error.log 2>/dev/null || echo "No error log"
fi

echo ""
echo "🎉 Port fix completed!"
