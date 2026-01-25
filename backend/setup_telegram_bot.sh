#!/bin/bash

# Setup Telegram Bot on Server

set -e

echo "🤖 Setting up Telegram Bot..."
echo "=============================="

cd /root/mirzoai/backend
source venv/bin/activate

# 1. Check .env file
echo ""
echo "📋 Checking .env file..."
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    exit 1
fi

# 2. Check Telegram variables
echo ""
echo "🔍 Checking Telegram configuration..."
TELEGRAM_BOT_TOKEN=$(grep "^TELEGRAM_BOT_TOKEN=" .env | cut -d'=' -f2 | tr -d '"' || echo "")
TELEGRAM_GROUP_ID=$(grep "^TELEGRAM_GROUP_ID=" .env | cut -d'=' -f2 | tr -d '"' || echo "-5134591143")
TELEGRAM_ADMIN_ID=$(grep "^TELEGRAM_ADMIN_ID=" .env | cut -d'=' -f2 | tr -d '"' || echo "5573250102")

if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "⚠️ TELEGRAM_BOT_TOKEN not found in .env"
    echo "📝 Adding default Telegram configuration to .env..."
    
    # Add Telegram config to .env
    if ! grep -q "TELEGRAM_BOT_TOKEN" .env; then
        echo "" >> .env
        echo "# Telegram Bot Configuration" >> .env
        echo "TELEGRAM_BOT_TOKEN=8399809187:AAFn1cxL_Ka9eQ9geaEbnhb5mQLCoryTVBc" >> .env
        echo "TELEGRAM_GROUP_ID=-5134591143" >> .env
        echo "TELEGRAM_ADMIN_ID=5573250102" >> .env
        echo "✅ Telegram configuration added to .env"
    fi
    
    # Reload
    TELEGRAM_BOT_TOKEN="8399809187:AAFn1cxL_Ka9eQ9geaEbnhb5mQLCoryTVBc"
else
    echo "✅ TELEGRAM_BOT_TOKEN found"
fi

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
sleep 2
python manage.py test_telegram_bot

# 6. Test sending message
echo ""
echo "📤 Testing message sending..."
python manage.py shell << EOF
from apps.api.telegram_service import send_telegram_message, TELEGRAM_GROUP_ID

message = "✅ <b>Telegram Bot Sozlandi!</b>\\n\\nBot endi ishga tushdi va to'lov cheklarini qabul qila oladi."
result = send_telegram_message(TELEGRAM_GROUP_ID, message)
if result:
    print("✅ Test xabar yuborildi!")
else:
    print("⚠️ Xabar yuborilmadi (bot guruhga qo'shilmagan bo'lishi mumkin)")
EOF

echo ""
echo "=============================="
echo "🎉 Telegram Bot setup completed!"
echo ""
echo "📍 Webhook URL: $WEBHOOK_URL"
echo "📍 Group ID: $TELEGRAM_GROUP_ID"
echo "📍 Admin ID: $TELEGRAM_ADMIN_ID"
echo ""
echo "✅ Bot is ready to receive payment notifications!"
