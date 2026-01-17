#!/bin/bash
#
# Tailscale Setup Script for Plante Pi Sensor API
#
# Usage: ./setup-tailscale.sh

set -e

echo "========================================="
echo "Tailscale Setup for Plante Pi"
echo "========================================="
echo ""

# Check if tailscale is installed
if ! command -v tailscale &> /dev/null; then
    echo "Installing Tailscale..."
    curl -fsSL https://tailscale.com/install.sh | sh
    echo "Tailscale installed!"
else
    echo "Tailscale already installed: $(tailscale version)"
fi

echo ""

# Check if already connected
if tailscale status &> /dev/null; then
    echo "Tailscale is already running"
    echo ""
    echo "Current status:"
    tailscale status
else
    echo "Starting Tailscale..."
    echo "A browser will open for authentication."
    sudo tailscale up
fi

echo ""

# Get Tailscale IP
TS_IP=$(tailscale ip -4 2>/dev/null || echo "not connected")
TS_HOSTNAME=$(tailscale status --json 2>/dev/null | grep -o '"Self":{[^}]*"HostName":"[^"]*"' | sed 's/.*"HostName":"\([^"]*\)".*/\1/' || echo "unknown")

echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo ""
echo "Tailscale IP: $TS_IP"
echo "Tailscale hostname: $TS_HOSTNAME"
echo ""
echo "Your Pi API will be accessible at:"
echo "  http://${TS_IP}:8000"
echo "  or"
echo "  http://${TS_HOSTNAME}:8000"
echo ""
echo "Add to your Next.js .env:"
echo "  PI_API_URL=http://${TS_IP}:8000"
echo ""
echo "Note: For Vercel deployments, use Cloudflare Tunnel instead"
echo "(Vercel serverless functions cannot join Tailscale networks)"
echo ""
