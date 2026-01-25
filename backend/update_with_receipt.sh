#!/bin/bash

# Update Backend with Receipt View Feature

set -e

echo "🔄 Updating Backend with Receipt Feature..."
echo "============================================="

cd /root/mirzoai/backend
source venv/bin/activate

# 1. Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# 2. Create and run migrations
echo "🗄️ Creating migrations..."
python manage.py makemigrations

echo "🗄️ Applying migrations..."
python manage.py migrate

# 3. Restart backend
echo "🔄 Restarting backend..."
systemctl restart mirzoai-backend

# 4. Check status
echo "✅ Checking backend status..."
sleep 2
systemctl status mirzoai-backend --no-pager -l | head -10

echo ""
echo "============================================="
echo "🎉 Backend updated!"
echo "📍 Receipt view feature is now available"
