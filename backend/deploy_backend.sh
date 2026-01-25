#!/bin/bash

# Mirzo AI Backend Deploy Script
# Server: 167.71.53.238
# Domain: mirzoaiapi.cdcgroup.uz

set -e

echo "🚀 Starting Backend Deployment..."

# 1. Create directory structure
echo "📁 Creating directory structure..."
mkdir -p /root/mirzoai
cd /root/mirzoai

# 2. Clone or update backend
if [ -d "backend" ]; then
    echo "📦 Updating existing backend..."
    cd backend
    git pull origin main
else
    echo "📦 Cloning backend from GitHub..."
    git clone https://github.com/aiziyrak-coder/MirzoAIAPI.git backend
    cd backend
fi

# 3. Create virtual environment
echo "🐍 Setting up Python virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate

# 4. Install dependencies
echo "📥 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn

# 5. Create .env file if not exists
if [ ! -f ".env" ]; then
    echo "⚙️ Creating .env file..."
    cat > .env << EOF
SECRET_KEY=$(python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')
DEBUG=False
FRONTEND_URL=https://mirzoai.cdcgroup.uz
GEMINI_API_KEY=AIzaSyAdT9dte_zH8Akh9nisSdIVY16xUoInbW4
TELEGRAM_BOT_TOKEN=8399809187:AAFn1cxL_Ka9eQ9geaEbnhb5mQLCoryTVBc
TELEGRAM_GROUP_ID=-5134591143
TELEGRAM_ADMIN_ID=5573250102
EOF
    echo "✅ .env file created. Please update GEMINI_API_KEY and other values if needed."
fi

# 6. Run migrations
echo "🗄️ Running database migrations..."
python manage.py migrate --noinput

# 7. Collect static files
echo "📦 Collecting static files..."
python manage.py collectstatic --noinput

# 8. Create systemd service file
echo "🔧 Creating systemd service..."
cat > /etc/systemd/system/mirzoai-backend.service << EOF
[Unit]
Description=Mirzo AI Backend Gunicorn Service
After=network.target

[Service]
User=root
Group=root
WorkingDirectory=/root/mirzoai/backend
Environment="PATH=/root/mirzoai/backend/venv/bin"
ExecStart=/root/mirzoai/backend/venv/bin/gunicorn \\
    --workers 3 \\
    --bind 127.0.0.1:8000 \\
    --timeout 120 \\
    --access-logfile /var/log/mirzoai-backend-access.log \\
    --error-logfile /var/log/mirzoai-backend-error.log \\
    mirzoai.wsgi:application

[Install]
WantedBy=multi-user.target
EOF

# 9. Reload systemd and start service
echo "🔄 Starting backend service..."
systemctl daemon-reload
systemctl enable mirzoai-backend
systemctl restart mirzoai-backend

# 10. Check status
echo "✅ Checking service status..."
systemctl status mirzoai-backend --no-pager -l

echo "🎉 Backend deployment completed!"
echo "📍 Backend is running on: http://127.0.0.1:8000"
echo "🌐 Public URL: https://mirzoaiapi.cdcgroup.uz"
