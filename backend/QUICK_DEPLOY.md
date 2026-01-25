# 🚀 Quick Deploy Guide - Mirzo AI

## Server Information
- **IP:** 167.71.53.238
- **Password:** Ziyrak2025Ai
- **Backend Domain:** mirzoaiapi.cdcgroup.uz
- **Frontend Domain:** mirzoai.cdcgroup.uz

## One-Command Deploy

Serverga kirib, quyidagi buyruqni bajarishingiz kifoya:

```bash
ssh root@167.71.53.238
# Password: Ziyrak2025Ai

# Keyin quyidagi buyruqlarni ketma-ket bajarishingiz kerak:

cd /root && mkdir -p mirzoai && cd mirzoai && \
wget -q https://raw.githubusercontent.com/aiziyrak-coder/MirzoAIAPI/main/deploy_all.sh && \
wget -q https://raw.githubusercontent.com/aiziyrak-coder/MirzoAIAPI/main/deploy_backend.sh && \
wget -q https://raw.githubusercontent.com/aiziyrak-coder/MirzoAIAPI/main/deploy_frontend.sh && \
wget -q https://raw.githubusercontent.com/aiziyrak-coder/MirzoAIAPI/main/deploy_backend_nginx.sh && \
wget -q https://raw.githubusercontent.com/aiziyrak-coder/MirzoAIAPI/main/deploy_ssl.sh && \
chmod +x deploy*.sh && \
./deploy_all.sh
```

## Step-by-Step Manual Deploy

### 1. Connect to Server
```bash
ssh root@167.71.53.238
# Enter password: Ziyrak2025Ai
```

### 2. Update System
```bash
apt-get update
apt-get upgrade -y
apt-get install -y git python3 python3-pip python3-venv nginx curl
```

### 3. Create Directory and Download Scripts
```bash
mkdir -p /root/mirzoai
cd /root/mirzoai

wget https://raw.githubusercontent.com/aiziyrak-coder/MirzoAIAPI/main/deploy_all.sh
wget https://raw.githubusercontent.com/aiziyrak-coder/MirzoAIAPI/main/deploy_backend.sh
wget https://raw.githubusercontent.com/aiziyrak-coder/MirzoAIAPI/main/deploy_frontend.sh
wget https://raw.githubusercontent.com/aiziyrak-coder/MirzoAIAPI/main/deploy_backend_nginx.sh
wget https://raw.githubusercontent.com/aiziyrak-coder/MirzoAIAPI/main/deploy_ssl.sh

chmod +x deploy*.sh
```

### 4. Run Deployment
```bash
./deploy_all.sh
```

Bu skript quyidagilarni bajaradi:
- ✅ Backend'ni GitHub'dan clone qiladi
- ✅ Python virtual environment yaratadi
- ✅ Dependencies o'rnatadi
- ✅ Database migrations bajaradi
- ✅ Gunicorn service yaratadi va ishga tushiradi
- ✅ Frontend'ni clone qiladi va build qiladi
- ✅ Nginx konfiguratsiyasini sozlaydi
- ✅ SSL sertifikatlarni o'rnatadi

## Verification

Deploy tugagandan keyin:

```bash
# Backend service status
systemctl status mirzoai-backend

# Nginx status
systemctl status nginx

# Test backend
curl https://mirzoaiapi.cdcgroup.uz/api/ai/quote/

# Test frontend
curl https://mirzoai.cdcgroup.uz
```

## Troubleshooting

### Backend not working
```bash
# Check logs
journalctl -u mirzoai-backend -n 50

# Restart
systemctl restart mirzoai-backend
```

### Nginx errors
```bash
# Test config
nginx -t

# Check logs
tail -f /var/log/nginx/error.log
```

### Update code
```bash
# Backend
cd /root/mirzoai/backend
git pull
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
systemctl restart mirzoai-backend

# Frontend
cd /root/mirzoai/frontend
git pull
npm install
npm run build
systemctl reload nginx
```
