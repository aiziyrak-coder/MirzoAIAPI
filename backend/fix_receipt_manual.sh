#!/bin/bash

# Manual Fix for Receipt Viewing Issue (with forced reset)

echo "🔧 Complete Receipt Fix (Manual)..."
echo "====================================="

cd /root/mirzoai/backend
source venv/bin/activate

# 1. Force reset to remote
echo "📥 Force resetting to remote..."
cd /root/mirzoai/backend
git fetch origin
git reset --hard origin/main || true
git clean -fd || true

# 2. Create and run migrations
echo "🗄️ Creating migrations..."
python manage.py makemigrations || echo "⚠️  No new migrations"

echo "🗄️ Applying migrations..."
python manage.py migrate

# 3. Update existing users with receipt files
echo "🔄 Updating existing users with receipt files..."
python << 'PYTHON_SCRIPT'
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mirzoai.settings')
django.setup()

from apps.api.models import User
from django.conf import settings
import glob

receipt_dir = os.path.join(settings.MEDIA_ROOT, 'receipts')
if os.path.exists(receipt_dir):
    receipt_files = glob.glob(os.path.join(receipt_dir, 'receipt_*'))
    updated_count = 0
    for receipt_path in receipt_files:
        filename = os.path.basename(receipt_path)
        parts = filename.split('_')
        if len(parts) >= 2:
            try:
                user_id = int(parts[1])
                user = User.objects.filter(id=user_id).first()
                if user:
                    user.receipt_file_name = filename
                    user.save(update_fields=['receipt_file_name'])
                    updated_count += 1
                    print(f"✅ Updated user {user_id} ({user.full_name}) with receipt: {filename}")
            except ValueError:
                pass
    print(f"\n📊 Updated {updated_count} users with receipt file names")
    print(f"📁 Found {len(receipt_files)} receipt files")
else:
    print(f"⚠️  Receipt directory not found: {receipt_dir}")
    os.makedirs(receipt_dir, exist_ok=True)
    print(f"✅ Receipt directory created")
PYTHON_SCRIPT

# 4. Fix Nginx config
echo ""
echo "🔧 Fixing Nginx config..."
BACKEND_NGINX=""
for config in "/etc/nginx/sites-available/mirzoai-backend" "/etc/nginx/sites-available/mirzoaiapi.cdcgroup.uz"; do
    if [ -f "$config" ]; then
        BACKEND_NGINX="$config"
        break
    fi
done

if [ -n "$BACKEND_NGINX" ] && [ -f "$BACKEND_NGINX" ]; then
    echo "📝 Found backend config: $BACKEND_NGINX"
    if ! grep -q "location /media/" "$BACKEND_NGINX"; then
        sed -i '/location \/static\//a\
    location /media/ {\
        alias /root/mirzoai/backend/media/;\
        expires 7d;\
        add_header Cache-Control "public";\
        access_log off;\
    }
' "$BACKEND_NGINX"
        echo "✅ Media location added"
    fi
    nginx -t && systemctl reload nginx
    echo "✅ Nginx reloaded"
fi

# 5. Fix permissions
MEDIA_DIR="/root/mirzoai/backend/media"
[ -d "$MEDIA_DIR" ] || mkdir -p "$MEDIA_DIR/receipts"
chmod -R 755 "$MEDIA_DIR"
chown -R root:root "$MEDIA_DIR"
echo "✅ Media directory permissions fixed"

# 6. Restart backend
echo "🔄 Restarting backend..."
systemctl restart mirzoai-backend
sleep 2
systemctl status mirzoai-backend --no-pager -l | head -15

echo ""
echo "====================================="
echo "🎉 Receipt fix completed!"
echo ""
echo "📍 Check media directory:"
echo "   ls -la /root/mirzoai/backend/media/receipts/"
