# Mirzo AI Deployment Instructions

## Server Information
- **IP:** 167.71.53.238
- **Password:** Ziyrak2025Ai
- **Backend Domain:** mirzoaiapi.cdcgroup.uz
- **Frontend Domain:** mirzoai.cdcgroup.uz

## Quick Deploy (All-in-One)

```bash
# 1. Connect to server
ssh root@167.71.53.238

# 2. Download deployment scripts
cd /root
wget https://raw.githubusercontent.com/aiziyrak-coder/MirzoAIAPI/main/deploy_all.sh
wget https://raw.githubusercontent.com/aiziyrak-coder/MirzoAIAPI/main/deploy_backend.sh
wget https://raw.githubusercontent.com/aiziyrak-coder/MirzoAIAPI/main/deploy_frontend.sh
wget https://raw.githubusercontent.com/aiziyrak-coder/MirzoAIAPI/main/deploy_backend_nginx.sh
wget https://raw.githubusercontent.com/aiziyrak-coder/MirzoAIAPI/main/deploy_ssl.sh

# 3. Make scripts executable
chmod +x deploy*.sh

# 4. Run complete deployment
./deploy_all.sh
```

## Step-by-Step Deployment

### Step 1: Connect to Server
```bash
ssh root@167.71.53.238
# Password: Ziyrak2025Ai
```

### Step 2: Update System
```bash
apt-get update
apt-get upgrade -y
apt-get install -y git python3 python3-pip python3-venv nginx curl
```

### Step 3: Create Directory Structure
```bash
mkdir -p /root/mirzoai
cd /root/mirzoai
```

### Step 4: Deploy Backend
```bash
# Clone backend
git clone https://github.com/aiziyrak-coder/MirzoAIAPI.git backend
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn

# Create .env file
cat > .env << EOF
SECRET_KEY=$(python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')
DEBUG=False
FRONTEND_URL=https://mirzoai.cdcgroup.uz
GEMINI_API_KEY=AIzaSyAdT9dte_zH8Akh9nisSdIVY16xUoInbW4
TELEGRAM_BOT_TOKEN=8399809187:AAFn1cxL_Ka9eQ9geaEbnhb5mQLCoryTVBc
TELEGRAM_GROUP_ID=-5134591143
TELEGRAM_ADMIN_ID=5573250102
EOF

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Create systemd service
cat > /etc/systemd/system/mirzoai-backend.service << 'SERVICE_EOF'
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
SERVICE_EOF

# Start service
systemctl daemon-reload
systemctl enable mirzoai-backend
systemctl restart mirzoai-backend
```

### Step 5: Configure Backend Nginx
```bash
cat > /etc/nginx/sites-available/mirzoai-backend << 'NGINX_EOF'
server {
    listen 80;
    server_name mirzoaiapi.cdcgroup.uz;

    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }

    location /static/ {
        alias /root/mirzoai/backend/static/;
    }

    location /media/ {
        alias /root/mirzoai/backend/media/;
    }
}
NGINX_EOF

ln -sf /etc/nginx/sites-available/mirzoai-backend /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### Step 6: Deploy Frontend
```bash
cd /root/mirzoai

# Clone frontend
git clone https://github.com/aiziyrak-coder/MirzoAI.git frontend
cd frontend

# Install Node.js if needed
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=https://mirzoaiapi.cdcgroup.uz/api
EOF

# Build frontend
npm run build
```

### Step 7: Configure Frontend Nginx
```bash
cat > /etc/nginx/sites-available/mirzoai-frontend << 'NGINX_EOF'
server {
    listen 80;
    server_name mirzoai.cdcgroup.uz;

    root /root/mirzoai/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINX_EOF

ln -sf /etc/nginx/sites-available/mirzoai-frontend /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### Step 8: Setup SSL Certificates
```bash
# Install certbot
apt-get install -y certbot python3-certbot-nginx

# Get certificates
certbot --nginx -d mirzoaiapi.cdcgroup.uz --non-interactive --agree-tos --email admin@cdcgroup.uz --redirect
certbot --nginx -d mirzoai.cdcgroup.uz --non-interactive --agree-tos --email admin@cdcgroup.uz --redirect

# Setup auto-renewal
systemctl enable certbot.timer
systemctl start certbot.timer
```

## Verification

### Check Backend
```bash
# Check service status
systemctl status mirzoai-backend

# Check logs
journalctl -u mirzoai-backend -f

# Test API
curl http://localhost:8000/api/ai/quote/
```

### Check Frontend
```bash
# Check nginx status
systemctl status nginx

# Test frontend
curl http://localhost/
```

## Troubleshooting

### Backend not starting
```bash
# Check logs
journalctl -u mirzoai-backend -n 50

# Restart service
systemctl restart mirzoai-backend
```

### Nginx errors
```bash
# Test configuration
nginx -t

# Check error logs
tail -f /var/log/nginx/error.log
```

### Frontend build errors
```bash
# Clear node_modules and rebuild
cd /root/mirzoai/frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Update Deployment

### Update Backend
```bash
cd /root/mirzoai/backend
git pull origin main
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
systemctl restart mirzoai-backend
```

### Update Frontend
```bash
cd /root/mirzoai/frontend
git pull origin main
npm install
npm run build
systemctl reload nginx
```
