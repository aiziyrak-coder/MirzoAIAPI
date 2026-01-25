#!/bin/bash

# Complete Deployment Script for Mirzo AI
# This script deploys both backend and frontend

set -e

echo "🚀 Starting Complete Mirzo AI Deployment..."
echo "=========================================="

# Update system
echo "📦 Updating system packages..."
apt-get update
apt-get upgrade -y

# Install required packages
echo "📥 Installing required packages..."
apt-get install -y git python3 python3-pip python3-venv nginx curl

# Navigate to mirzoai directory
cd /root/mirzoai

# Run backend deployment
echo ""
echo "🔷 Deploying Backend..."
bash /root/mirzoai/deploy_backend.sh

# Configure backend nginx
echo ""
echo "🔷 Configuring Backend Nginx..."
bash /root/mirzoai/deploy_backend_nginx.sh

# Run frontend deployment
echo ""
echo "🔶 Deploying Frontend..."
bash /root/mirzoai/deploy_frontend.sh

# Setup SSL
echo ""
echo "🔒 Setting up SSL Certificates..."
bash /root/mirzoai/deploy_ssl.sh

echo ""
echo "=========================================="
echo "🎉 Deployment Completed Successfully!"
echo ""
echo "📍 Backend API: https://mirzoaiapi.cdcgroup.uz"
echo "📍 Frontend: https://mirzoai.cdcgroup.uz"
echo ""
echo "✅ All services are running!"
