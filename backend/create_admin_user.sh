#!/bin/bash

# Create Admin User Script

set -e

echo "👤 Creating Admin User..."
echo "========================="

cd /root/mirzoai/backend
source venv/bin/activate

# Create admin user with phone 998948788878 and password 123
echo "📝 Creating admin user..."
python manage.py shell << EOF
from apps.api.models import User

phone = '998948788878'
password = '123'

# Check if user exists
try:
    user = User.objects.get(phone_number=phone)
    print(f"User {phone} already exists. Updating to admin...")
    user.is_admin = True
    user.is_staff = True
    user.is_superuser = True
    user.subscription_status = 'ACTIVE'
    user.set_password(password)
    user.save()
    print(f"✅ User {phone} updated to admin successfully!")
except User.DoesNotExist:
    print(f"Creating new admin user {phone}...")
    user = User.objects.create_user(
        phone_number=phone,
        password=password,
        full_name='System Admin',
        organization='Mirzo AI',
    )
    user.is_admin = True
    user.is_staff = True
    user.is_superuser = True
    user.subscription_status = 'ACTIVE'
    user.save()
    print(f"✅ Admin user {phone} created successfully!")

print(f"\n📋 Admin User Details:")
print(f"   Phone: {phone}")
print(f"   Password: {password}")
print(f"   Is Admin: {user.is_admin}")
print(f"   Subscription: {user.subscription_status}")
EOF

echo ""
echo "========================="
echo "🎉 Admin user created/updated!"
echo ""
echo "📍 Login with:"
echo "   Phone: 998948788878"
echo "   Password: 123"
