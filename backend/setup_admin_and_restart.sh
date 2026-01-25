#!/bin/bash

# Setup Admin User and Restart Backend on Server
# Server: 167.71.53.238

set -e

echo "🚀 Setting up admin user and restarting backend..."
echo "=================================================="

# Navigate to backend directory
cd /root/mirzoai/backend || {
    echo "❌ Backend directory not found. Please run deploy_backend.sh first."
    exit 1
}

# Activate virtual environment
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run deploy_backend.sh first."
    exit 1
fi

source venv/bin/activate

# Run migrations
echo ""
echo "🗄️ Running database migrations..."
python manage.py migrate --noinput

# Create admin user with phone_number='xazrat' and password='123'
echo ""
echo "👤 Creating/updating admin user (xazrat / 123)..."
python manage.py shell << EOF
from apps.api.models import User

phone_number = 'xazrat'
password = '123'
full_name = 'Xazrat Admin'
organization = 'Mirzo AI'

try:
    user = User.objects.get(phone_number=phone_number)
    print(f"✅ Foydalanuvchi {phone_number} allaqachon mavjud. Yangilanmoqda...")
    user.full_name = full_name
    user.organization = organization
    user.is_admin = True
    user.is_staff = True
    user.is_superuser = True
    user.subscription_status = 'ACTIVE'
    user.is_active = True
    user.set_password(password)
    user.save()
    print(f"✅ Foydalanuvchi {phone_number} admin sifatida yangilandi!")
except User.DoesNotExist:
    print(f"📝 Yangi admin foydalanuvchi yaratilmoqda: {phone_number}")
    user = User.objects.create_superuser(
        phone_number=phone_number,
        password=password,
        full_name=full_name,
        organization=organization,
    )
    user.subscription_status = 'ACTIVE'
    user.is_admin = True
    user.save()
    print(f"✅ Admin foydalanuvchi {phone_number} muvaffaqiyatli yaratildi!")

print(f"\n📋 Admin Login Ma'lumotlari:")
print(f"   Telefon Raqam (Login): {phone_number}")
print(f"   Parol: {password}")
print(f"   Is Admin: {user.is_admin}")
print(f"   Is Staff: {user.is_staff}")
print(f"   Is Superuser: {user.is_superuser}")
print(f"   Subscription: {user.subscription_status}")
EOF

# Collect static files
echo ""
echo "📦 Collecting static files..."
python manage.py collectstatic --noinput

# Restart backend service
echo ""
echo "🔄 Restarting backend service..."
systemctl restart mirzoai-backend
sleep 3

# Check service status
echo ""
echo "📊 Checking service status..."
systemctl status mirzoai-backend --no-pager -l | head -20

# Test backend
echo ""
echo "🧪 Testing backend..."
sleep 2
if curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/health | grep -q "200"; then
    echo "✅ Backend is running successfully!"
    echo "📍 Backend URL: http://127.0.0.1:8000"
    echo "🌐 Public URL: https://mirzoaiapi.cdcgroup.uz"
    echo "👤 Admin Panel: https://mirzoaiapi.cdcgroup.uz/admin/"
    echo "   Login: xazrat"
    echo "   Password: 123"
else
    echo "⚠️  Backend might not be responding. Check logs:"
    echo "   journalctl -u mirzoai-backend -n 50"
fi

echo ""
echo "🎉 Setup completed!"
