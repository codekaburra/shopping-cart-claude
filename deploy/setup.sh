#!/usr/bin/env bash
# EC2 Ubuntu first-time setup script
# Run as: sudo bash deploy/setup.sh
set -euo pipefail

echo "=== 1. System update ==="
apt update && apt upgrade -y

echo "=== 2. Install Node.js 22 ==="
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt install -y nodejs
fi
echo "Node: $(node -v), npm: $(npm -v)"

echo "=== 3. Install PM2 ==="
npm install -g pm2

echo "=== 4. Install Nginx ==="
apt install -y nginx

echo "=== 5. Configure Nginx ==="
cp /home/ubuntu/shopping-cart-claude/deploy/nginx.conf /etc/nginx/sites-available/shop
ln -sf /etc/nginx/sites-available/shop /etc/nginx/sites-enabled/shop
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
systemctl enable nginx

echo "=== 6. PM2 startup ==="
pm2 startup systemd -u ubuntu --hp /home/ubuntu

echo ""
echo "Setup complete! Now run:"
echo "  sudo -u ubuntu bash deploy/deploy.sh"
