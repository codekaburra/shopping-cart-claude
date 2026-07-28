#!/usr/bin/env bash
# EC2 Ubuntu first-time setup script
# Run as: sudo bash deploy/setup.sh
set -euo pipefail

APP_DIR="/home/ubuntu/shopping-cart-claude"

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
# The domain lives in .env (gitignored), not in the repo. Falling back to `_`
# keeps the block as the port-80 default server, so plain-IP access still works.
DOMAIN="$(sed -n 's/^DOMAIN=//p' "$APP_DIR/.env" 2>/dev/null | head -1 | tr -d '"' | xargs || true)"
if [ -z "$DOMAIN" ]; then
  SERVER_NAMES="_"
  echo "No DOMAIN in .env — nginx will accept any hostname."
  echo "For HTTPS, set DOMAIN in .env and re-run this script (certbot needs it)."
else
  SERVER_NAMES="$DOMAIN"
  # Convenience: given a bare apex domain, also answer for its www form, so
  # .env only needs `DOMAIN="example.com"`. Subdomains are left alone, since
  # www.shop.example.com rarely has a DNS record — and asking certbot for a
  # name that does not resolve fails the whole certificate request. Writing
  # several names explicitly disables this and is used verbatim.
  if [ "$(echo "$DOMAIN" | wc -w)" -eq 1 ] &&
    [ "$(echo "$DOMAIN" | awk -F. '{print NF}')" -eq 2 ]; then
    SERVER_NAMES="$DOMAIN www.$DOMAIN"
  fi
  echo "server_name: $SERVER_NAMES"
fi
sed "s|__DOMAIN__|$SERVER_NAMES|g" "$APP_DIR/deploy/nginx.conf" > /etc/nginx/sites-available/shop
ln -sf /etc/nginx/sites-available/shop /etc/nginx/sites-enabled/shop
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
systemctl enable nginx

echo "=== 6. PM2 startup ==="
pm2 startup systemd -u ubuntu --hp /home/ubuntu

echo ""
echo "Setup complete! Now run (as the ubuntu user, not root):"
echo "  bash deploy/deploy.sh"

if [ "$SERVER_NAMES" != "_" ]; then
  echo ""
  echo "For HTTPS — once 'dig +short ${SERVER_NAMES%% *}' returns this server's IP:"
  echo -n "  sudo certbot --nginx"
  for d in $SERVER_NAMES; do echo -n " -d $d"; done
  echo ""
fi
