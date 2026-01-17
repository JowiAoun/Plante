#!/bin/bash
#
# Cloudflare Tunnel Setup Script for Plante Pi Sensor API
#
# Prerequisites:
# - Cloudflare account with a domain
# - Domain DNS managed by Cloudflare
#
# Usage: ./setup-cloudflare-tunnel.sh <subdomain> <domain>
# Example: ./setup-cloudflare-tunnel.sh pi-sensors example.com

set -e

SUBDOMAIN="${1:-pi-sensors}"
DOMAIN="${2:-yourdomain.com}"
TUNNEL_NAME="plante-pi"
LOCAL_PORT="8000"

echo "========================================="
echo "Cloudflare Tunnel Setup for Plante Pi"
echo "========================================="
echo "Subdomain: ${SUBDOMAIN}.${DOMAIN}"
echo ""

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo "Installing cloudflared..."
    
    # Detect architecture
    ARCH=$(uname -m)
    if [ "$ARCH" = "aarch64" ]; then
        DEB_URL="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb"
    elif [ "$ARCH" = "armv7l" ]; then
        DEB_URL="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm.deb"
    else
        DEB_URL="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb"
    fi
    
    curl -L "$DEB_URL" -o /tmp/cloudflared.deb
    sudo dpkg -i /tmp/cloudflared.deb
    rm /tmp/cloudflared.deb
    echo "cloudflared installed!"
else
    echo "cloudflared already installed: $(cloudflared --version)"
fi

echo ""

# Check if already authenticated
if [ ! -f ~/.cloudflared/cert.pem ]; then
    echo "Authenticating with Cloudflare..."
    echo "A browser window will open. Log in and authorize the domain."
    cloudflared tunnel login
else
    echo "Already authenticated with Cloudflare"
fi

echo ""

# Check if tunnel exists
if cloudflared tunnel list | grep -q "$TUNNEL_NAME"; then
    echo "Tunnel '$TUNNEL_NAME' already exists"
    TUNNEL_ID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
else
    echo "Creating tunnel '$TUNNEL_NAME'..."
    cloudflared tunnel create "$TUNNEL_NAME"
    TUNNEL_ID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
fi

echo "Tunnel ID: $TUNNEL_ID"
echo ""

# Create config file
CONFIG_DIR="$HOME/.cloudflared"
CONFIG_FILE="$CONFIG_DIR/config.yml"

echo "Creating config at $CONFIG_FILE..."
mkdir -p "$CONFIG_DIR"

cat > "$CONFIG_FILE" << EOF
# Cloudflare Tunnel config for Plante Pi Sensor API
tunnel: $TUNNEL_ID
credentials-file: $CONFIG_DIR/$TUNNEL_ID.json

ingress:
  - hostname: ${SUBDOMAIN}.${DOMAIN}
    service: http://localhost:${LOCAL_PORT}
  - service: http_status:404
EOF

echo "Config file created!"
echo ""

# Create DNS record
echo "Creating DNS record for ${SUBDOMAIN}.${DOMAIN}..."
cloudflared tunnel route dns "$TUNNEL_NAME" "${SUBDOMAIN}.${DOMAIN}" || echo "DNS record may already exist"

echo ""
echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo ""
echo "Your Pi API will be accessible at:"
echo "  https://${SUBDOMAIN}.${DOMAIN}"
echo ""
echo "To start the tunnel manually:"
echo "  cloudflared tunnel run $TUNNEL_NAME"
echo ""
echo "To install as a system service:"
echo "  sudo cloudflared service install"
echo "  sudo systemctl enable cloudflared"
echo "  sudo systemctl start cloudflared"
echo ""
echo "Don't forget to:"
echo "1. Start the FastAPI server: python -m api.main"
echo "2. Update your Next.js .env with:"
echo "   PI_API_URL=https://${SUBDOMAIN}.${DOMAIN}"
echo ""
