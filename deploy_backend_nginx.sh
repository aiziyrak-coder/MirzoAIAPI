#!/bin/bash

# Nginx Configuration for Backend API
# Domain: mirzoaiapi.cdcgroup.uz

set -e

echo "🔧 Configuring Nginx for Backend API..."

# Create nginx configuration for backend
cat > /etc/nginx/sites-available/mirzoai-backend << 'EOF'
server {
    listen 80;
    server_name mirzoaiapi.cdcgroup.uz;

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

    # API location
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        
        # WebSocket support (if needed)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }

    # Static files
    location /static/ {
        alias /root/mirzoai/backend/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Media files
    location /media/ {
        alias /root/mirzoai/backend/media/;
        expires 7d;
        add_header Cache-Control "public";
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/mirzoai-backend /etc/nginx/sites-enabled/

# Remove default nginx site if exists
if [ -f /etc/nginx/sites-enabled/default ]; then
    rm /etc/nginx/sites-enabled/default
fi

# Test and reload nginx
echo "🔄 Testing and reloading Nginx..."
nginx -t
systemctl reload nginx

echo "✅ Nginx configuration for backend completed!"
