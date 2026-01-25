#!/bin/bash

# Fix Receipt Migration and Update Existing Users

set -e

echo "🔧 Fixing Receipt Migration..."
echo "==============================="

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
                if user and not user.receipt_file_name:
                    user.receipt_file_name = filename
                    user.save(update_fields=['receipt_file_name'])
                    updated_count += 1
                    print(f"✅ Updated user {user_id} ({user.full_name}) with receipt: {filename}")
            except ValueError:
                pass
    
    print(f"\n📊 Updated {updated_count} users with receipt file names")
else:
    print("⚠️  Receipt directory not found: {receipt_dir}")

PYTHON_SCRIPT

# 4. Restart backend
echo "🔄 Restarting backend..."
systemctl restart mirzoai-backend

# 5. Check status
echo "✅ Checking backend status..."
sleep 2
systemctl status mirzoai-backend --no-pager -l | head -10

echo ""
echo "==============================="
echo "🎉 Receipt migration fixed!"
echo "📍 Existing receipt files have been linked to users"
