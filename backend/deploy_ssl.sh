#!/bin/bash

# SSL Certificate Setup with Let's Encrypt
# Domains: mirzoaiapi.cdcgroup.uz, mirzoai.cdcgroup.uz

set -e

echo "🔒 Setting up SSL Certificates..."

# Install certbot if not installed
if ! command -v certbot &> /dev/null; then
    echo "📥 Installing Certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
fi

# Get SSL certificates for both domains
echo "📜 Getting SSL certificates..."

# Backend domain
certbot --nginx -d mirzoaiapi.cdcgroup.uz --non-interactive --agree-tos --email admin@cdcgroup.uz --redirect

# Frontend domain
certbot --nginx -d mirzoai.cdcgroup.uz --non-interactive --agree-tos --email admin@cdcgroup.uz --redirect

# Setup auto-renewal
echo "🔄 Setting up auto-renewal..."
systemctl enable certbot.timer
systemctl start certbot.timer

echo "✅ SSL certificates installed!"
echo "🌐 Backend: https://mirzoaiapi.cdcgroup.uz"
echo "🌐 Frontend: https://mirzoai.cdcgroup.uz"
