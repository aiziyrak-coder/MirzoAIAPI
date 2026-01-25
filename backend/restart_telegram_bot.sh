#!/bin/bash

# Restart Telegram Bot and Verify

set -e

echo "🤖 Restarting Telegram Bot..."
echo "=============================="

cd /root/mirzoai/backend
source venv/bin/activate

# 1. Check .env file
echo "📋 Checking .env file..."
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    exit 1
fi

# 2. Check Telegram configuration
echo "🔍 Checking Telegram configuration..."
TELEGRAM_BOT_TOKEN=$(grep "^TELEGRAM_BOT_TOKEN=" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
TELEGRAM_GROUP_ID=$(grep "^TELEGRAM_GROUP_ID=" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
TELEGRAM_ADMIN_ID=$(grep "^TELEGRAM_ADMIN_ID=" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")

if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "❌ TELEGRAM_BOT_TOKEN not found in .env"
    exit 1
fi

echo "✅ TELEGRAM_BOT_TOKEN found"
echo "✅ TELEGRAM_GROUP_ID: ${TELEGRAM_GROUP_ID:-not set}"
echo "✅ TELEGRAM_ADMIN_ID: ${TELEGRAM_ADMIN_ID:-not set}"

# 3. Test bot connection
echo ""
echo "🧪 Testing bot connection..."
python manage.py test_telegram_bot

# 4. Setup webhook
echo ""
echo "🔗 Setting up webhook..."
WEBHOOK_URL="https://mirzoaiapi.cdcgroup.uz/api/telegram/webhook/"
python manage.py setup_telegram_webhook --url "$WEBHOOK_URL"

# 5. Verify webhook
echo ""
echo "🔍 Verifying webhook..."
python manage.py test_telegram_bot

# 6. Send test message
echo ""
echo "📤 Sending test message to group..."
python manage.py shell << 'PYTHON_SCRIPT'
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mirzoai.settings')
import django
django.setup()

from apps.api.telegram_service import send_telegram_message

TELEGRAM_GROUP_ID = os.getenv('TELEGRAM_GROUP_ID', '-5134591143')
message = "✅ <b>Telegram Bot Qayta Ishga Tushirildi!</b>\n\nBot endi to'lov cheklarini qabul qila oladi."
result = send_telegram_message(TELEGRAM_GROUP_ID, message)
if result:
    print("✅ Test xabar yuborildi!")
else:
    print("⚠️  Test xabar yuborilmadi")
PYTHON_SCRIPT

# 7. Restart backend to ensure bot is running
echo ""
echo "🔄 Restarting backend service..."
systemctl restart mirzoai-backend

# 8. Check status
echo ""
echo "✅ Checking backend status..."
sleep 2
systemctl status mirzoai-backend --no-pager -l | head -15

echo ""
echo "=============================="
echo "🎉 Telegram Bot restarted!"
echo ""
echo "📍 Webhook URL: https://mirzoaiapi.cdcgroup.uz/api/telegram/webhook/"
echo "📍 Group ID: ${TELEGRAM_GROUP_ID:-not set}"
echo "📍 Admin ID: ${TELEGRAM_ADMIN_ID:-not set}"
echo ""
echo "✅ Bot is ready to receive payment notifications!"
