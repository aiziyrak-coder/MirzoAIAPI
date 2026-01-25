#!/bin/bash

# Fix Permissions and Backend Issues

set -e

echo "🔧 Fixing permissions and backend issues..."

# 1. Fix all permissions
echo "📁 Fixing permissions..."
chown -R root:root /root/mirzoai
chmod -R 755 /root/mirzoai
chmod -R 755 /root/mirzoai/backend
chmod -R 755 /root/mirzoai/frontend
chmod -R 755 /root/mirzoai/frontend/dist

# 2. Check backend error logs
echo "🔍 Checking backend error logs..."
if [ -f "/var/log/mirzoai-backend-error.log" ]; then
    echo "--- Backend Error Log (last 30 lines) ---"
    tail -30 /var/log/mirzoai-backend-error.log
fi

# 3. Check backend manually
echo "🔍 Testing backend manually..."
cd /root/mirzoai/backend
source venv/bin/activate

# Check if Django can start
echo "Testing Django..."
python manage.py check || echo "Django check failed"

# 4. Fix nginx user issue - change nginx to run as root or fix permissions
echo "🔧 Fixing nginx configuration..."

# Option 1: Change nginx user to root (for /root access)
sed -i 's/^user www-data;/user root;/' /etc/nginx/nginx.conf || echo "Could not change nginx user"

# Option 2: Or create symlink in /var/www
mkdir -p /var/www/mirzoai
if [ ! -L /var/www/mirzoai/frontend ]; then
    ln -sf /root/mirzoai/frontend/dist /var/www/mirzoai/frontend
fi
chown -R www-data:www-data /var/www/mirzoai 2>/dev/null || true

# 5. Update frontend nginx config to use /var/www or keep /root with root user
cat > /etc/nginx/sites-available/mirzoai-frontend << 'EOF'
server {
    listen 80;
    server_name mirzoai.cdcgroup.uz;

    root /root/mirzoai/frontend/dist;
    index index.html;

    client_max_body_size 20M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Main location
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Fix favicon
    location = /favicon.ico {
        log_not_found off;
        access_log off;
    }

    # Fix robots.txt
    location = /robots.txt {
        log_not_found off;
        access_log off;
    }
}
EOF

# 6. Check backend service file
echo "🔧 Checking backend service configuration..."
cat > /etc/systemd/system/mirzoai-backend.service << 'EOF'
[Unit]
Description=Mirzo AI Backend Gunicorn Service
After=network.target

[Service]
User=root
Group=root
WorkingDirectory=/root/mirzoai/backend
Environment="PATH=/root/mirzoai/backend/venv/bin"
EnvironmentFile=/root/mirzoai/backend/.env
ExecStart=/root/mirzoai/backend/venv/bin/gunicorn \
    --workers 3 \
    --bind 127.0.0.1:8000 \
    --timeout 120 \
    --access-logfile /var/log/mirzoai-backend-access.log \
    --error-logfile /var/log/mirzoai-backend-error.log \
    mirzoai.wsgi:application

Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# 7. Test backend manually first
echo "🧪 Testing backend startup..."
cd /root/mirzoai/backend
source venv/bin/activate

# Try to import Django
python -c "import django; print(f'Django version: {django.get_version()}')" || {
    echo "❌ Django import failed!"
    exit 1
}

# Try to check settings
python manage.py check --deploy || {
    echo "⚠️ Django check warnings (may be OK)"
}

# 8. Reload systemd and restart
echo "🔄 Reloading systemd and restarting services..."
systemctl daemon-reload
systemctl restart mirzoai-backend
sleep 2

# 9. Test nginx and reload
echo "🔄 Testing and reloading nginx..."
nginx -t
systemctl reload nginx

# 10. Check status
echo ""
echo "✅ Checking services status..."
echo "--- Backend Status ---"
systemctl status mirzoai-backend --no-pager -l | head -15

echo ""
echo "--- Backend Error Log (last 10 lines) ---"
tail -10 /var/log/mirzoai-backend-error.log 2>/dev/null || echo "No error log yet"

echo ""
echo "--- Testing Backend API ---"
sleep 1
curl -s http://127.0.0.1:8000/api/ai/quote/ | head -3 || echo "Backend not responding"

echo ""
echo "🎉 Fix completed!"
echo "📍 Test frontend: curl http://mirzoai.cdcgroup.uz"
echo "📍 Test backend: curl http://mirzoaiapi.cdcgroup.uz/api/ai/quote/"
