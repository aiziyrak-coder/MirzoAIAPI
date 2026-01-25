#!/bin/bash

# Complete Fix for Receipt Viewing Issue

set -e

echo "🔧 Complete Receipt Fix..."
echo "==========================="

cd /root/mirzoai/backend
source venv/bin/activate

# 1. Pull latest changes (discard local changes)
echo "📥 Pulling latest changes..."
echo "🗑️  Discarding local changes..."
cd /root/mirzoai/backend
git fetch origin
git reset --hard origin/main
git clean -fd

# 2. Create and run migrations
echo "🗄️ Creating migrations..."
python manage.py makemigrations

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
    # Find all receipt files
    receipt_files = glob.glob(os.path.join(receipt_dir, 'receipt_*'))
    
    updated_count = 0
    for receipt_path in receipt_files:
        filename = os.path.basename(receipt_path)
        # Extract user ID from filename: receipt_{user_id}_{timestamp}.{ext}
        parts = filename.split('_')
        if len(parts) >= 2:
            try:
                user_id = int(parts[1])
                user = User.objects.filter(id=user_id).first()
                if user:
                    # Update even if receipt_file_name exists (use most recent)
                    user.receipt_file_name = filename
                    user.save(update_fields=['receipt_file_name'])
                    updated_count += 1
                    print(f"✅ Updated user {user_id} ({user.full_name}) with receipt: {filename}")
            except ValueError:
                pass
    
    print(f"\n📊 Updated {updated_count} users with receipt file names")
    
    # List all receipt files
    print(f"\n📁 Found {len(receipt_files)} receipt files in {receipt_dir}")
else:
    print(f"⚠️  Receipt directory not found: {receipt_dir}")
    print(f"📁 Creating receipt directory...")
    os.makedirs(receipt_dir, exist_ok=True)
    print(f"✅ Receipt directory created")

PYTHON_SCRIPT

# 4. Fix Nginx config for media files
echo ""
echo "🔧 Fixing Nginx config for media files..."

# Find backend nginx config
BACKEND_NGINX=""
if [ -f "/etc/nginx/sites-available/mirzoai-backend" ]; then
    BACKEND_NGINX="/etc/nginx/sites-available/mirzoai-backend"
elif [ -f "/etc/nginx/sites-available/mirzoaiapi.cdcgroup.uz" ]; then
    BACKEND_NGINX="/etc/nginx/sites-available/mirzoaiapi.cdcgroup.uz"
else
    BACKEND_NGINX=$(ls /etc/nginx/sites-available/*backend* 2>/dev/null | head -1)
fi

if [ -n "$BACKEND_NGINX" ] && [ -f "$BACKEND_NGINX" ]; then
    echo "📝 Found backend config: $BACKEND_NGINX"
    
    # Check if media location exists
    if ! grep -q "location /media/" "$BACKEND_NGINX"; then
        # Add media location before the closing brace
        sed -i '/location \/static\//a\
    # Media files\
    location /media/ {\
        alias /root/mirzoai/backend/media/;\
        expires 7d;\
        add_header Cache-Control "public";\
        access_log off;\
    }
' "$BACKEND_NGINX"
        echo "✅ Media location added to backend config"
    else
        echo "ℹ️  Media location already exists in backend config"
    fi
    
    # Test and reload
    nginx -t && systemctl reload nginx
    echo "✅ Nginx reloaded"
else
    echo "⚠️  Backend Nginx config not found. Creating default config..."
    
    cat > /etc/nginx/sites-available/mirzoai-backend << 'EOF'
server {
    listen 80;
    server_name mirzoaiapi.cdcgroup.uz;

    client_max_body_size 20M;

    # API location
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }

    # Static files
    location /static/ {
        alias /root/mirzoai/backend/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Media files
    location /media/ {
        alias /root/mirzoai/backend/media/;
        expires 7d;
        add_header Cache-Control "public";
        access_log off;
    }
}
EOF
    
    ln -sf /etc/nginx/sites-available/mirzoai-backend /etc/nginx/sites-enabled/
    nginx -t && systemctl reload nginx
    echo "✅ Default Nginx config created and reloaded"
fi

# 5. Fix media directory permissions
MEDIA_DIR="/root/mirzoai/backend/media"
if [ -d "$MEDIA_DIR" ]; then
    echo "📁 Fixing media directory permissions..."
    chmod -R 755 "$MEDIA_DIR"
    chown -R root:root "$MEDIA_DIR"
    echo "✅ Media directory permissions fixed"
else
    echo "📁 Creating media directory..."
    mkdir -p "$MEDIA_DIR/receipts"
    chmod -R 755 "$MEDIA_DIR"
    chown -R root:root "$MEDIA_DIR"
    echo "✅ Media directory created"
fi

# 6. Restart backend
echo "🔄 Restarting backend..."
systemctl restart mirzoai-backend

# 7. Check status
echo "✅ Checking backend status..."
sleep 2
systemctl status mirzoai-backend --no-pager -l | head -15

echo ""
echo "==========================="
echo "🎉 Receipt fix completed!"
echo ""
echo "📍 Test receipt access:"
echo "   curl https://mirzoaiapi.cdcgroup.uz/media/receipts/receipt_*"
echo ""
echo "📍 Check media directory:"
echo "   ls -la /root/mirzoai/backend/media/receipts/"
