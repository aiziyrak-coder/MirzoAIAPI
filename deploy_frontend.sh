#!/bin/bash

# Mirzo AI Frontend Deploy Script
# Server: 167.71.53.238
# Domain: mirzoai.cdcgroup.uz

set -e

echo "🚀 Starting Frontend Deployment..."

# 1. Navigate to directory
echo "📁 Navigating to directory..."
mkdir -p /root/mirzoai
cd /root/mirzoai

# 2. Clone or update frontend
if [ -d "frontend" ]; then
    echo "📦 Updating existing frontend..."
    cd frontend
    git pull origin main
else
    echo "📦 Cloning frontend from GitHub..."
    git clone https://github.com/aiziyrak-coder/MirzoAI.git frontend
    cd frontend
fi

# 3. Install Node.js if not installed
if ! command -v node &> /dev/null; then
    echo "📥 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# 4. Install dependencies
echo "📥 Installing npm dependencies..."
npm install

# 5. Create .env file if not exists
if [ ! -f ".env" ]; then
    echo "⚙️ Creating .env file..."
    cat > .env << EOF
VITE_API_URL=https://mirzoaiapi.cdcgroup.uz/api
EOF
fi

# 6. Build frontend
echo "🏗️ Building frontend..."
npm run build

# 7. Install nginx if not installed
if ! command -v nginx &> /dev/null; then
    echo "📥 Installing Nginx..."
    apt-get update
    apt-get install -y nginx
fi

# 8. Create nginx configuration for frontend
echo "🔧 Creating Nginx configuration..."
cat > /etc/nginx/sites-available/mirzoai-frontend << EOF
server {
    listen 80;
    server_name mirzoai.cdcgroup.uz;

    root /root/mirzoai/frontend/dist;
    index index.html;

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
        try_files \$uri \$uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# 9. Enable site
ln -sf /etc/nginx/sites-available/mirzoai-frontend /etc/nginx/sites-enabled/

# 10. Test and reload nginx
echo "🔄 Testing and reloading Nginx..."
nginx -t
systemctl reload nginx

echo "🎉 Frontend deployment completed!"
echo "🌐 Frontend URL: http://mirzoai.cdcgroup.uz"
echo "📝 Next step: Configure SSL with certbot"
