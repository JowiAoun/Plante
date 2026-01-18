#!/bin/bash
# Plante Raspberry Pi Setup Script
# This script sets up the virtual environment, installs dependencies,
# and configures the systemd service for the Plante Sensor API.

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     Plante Raspberry Pi Setup          ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HARDWARE_DIR="$(dirname "$SCRIPT_DIR")"
SERVICE_FILE="$HARDWARE_DIR/plante-api.service"
VENV_DIR="$HARDWARE_DIR/venv"

echo -e "\n${YELLOW}[1/5]${NC} Checking prerequisites..."

# Check if running on Raspberry Pi
if ! grep -q "Raspberry Pi" /proc/cpuinfo 2>/dev/null && ! grep -q "BCM" /proc/cpuinfo 2>/dev/null; then
    echo -e "${YELLOW}Warning: This doesn't appear to be a Raspberry Pi. Continuing anyway...${NC}"
fi

# Check for Python 3
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is not installed. Please install it first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Python 3 found: $(python3 --version)"

# Check for pip
if ! python3 -m pip --version &> /dev/null; then
    echo -e "${YELLOW}Installing pip...${NC}"
    sudo apt-get update && sudo apt-get install -y python3-pip python3-venv
fi

# Install libgpiod for DHT sensor support
echo -e "\n${YELLOW}[2/5]${NC} Installing system dependencies..."
sudo apt-get update

# Required build dependencies
sudo apt-get install -y libcap-dev python3-dev liblgpio-dev swig

# Install available GPIO packages - ignore errors for packages that don't exist
for pkg in python3-libgpiod libgpiod-dev gpiod python3-gpiod; do
    if apt-cache show "$pkg" &>/dev/null; then
        echo -e "Installing $pkg..."
        sudo apt-get install -y "$pkg" || true
    fi
done
echo -e "${GREEN}✓${NC} System dependencies installed"

echo -e "\n${YELLOW}[3/5]${NC} Setting up Python virtual environment..."

# Ensure venv module is available
sudo apt-get install -y python3-venv

# Create virtual environment if it doesn't exist
if [ -d "$VENV_DIR" ]; then
    echo -e "${YELLOW}Virtual environment already exists. Recreating...${NC}"
    rm -rf "$VENV_DIR"
fi

python3 -m venv "$VENV_DIR" || {
    echo -e "${RED}Failed to create virtual environment. Trying with --without-pip...${NC}"
    python3 -m venv --without-pip "$VENV_DIR"
    curl -sS https://bootstrap.pypa.io/get-pip.py | "$VENV_DIR/bin/python3"
}
echo -e "${GREEN}✓${NC} Virtual environment created at $VENV_DIR"

# Activate venv and install dependencies
echo -e "\n${YELLOW}[4/5]${NC} Installing Python dependencies..."
source "$VENV_DIR/bin/activate"
pip install --upgrade pip
pip install -r "$HARDWARE_DIR/requirements.txt"
echo -e "${GREEN}✓${NC} Dependencies installed"

echo -e "\n${YELLOW}[5/5]${NC} Setting up systemd service..."

# Update service file with current user and paths
CURRENT_USER=$(whoami)
CURRENT_HOME=$(eval echo ~$CURRENT_USER)

# Create a temporary service file with correct paths
TMP_SERVICE="/tmp/plante-api.service"
cat > "$TMP_SERVICE" << EOF
[Unit]
Description=Plante Sensor API
After=network.target

[Service]
Type=simple
User=$CURRENT_USER
WorkingDirectory=$HARDWARE_DIR
Environment="PATH=$VENV_DIR/bin"
Environment="PYTHONPATH=$HARDWARE_DIR"
ExecStart=$VENV_DIR/bin/uvicorn api.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Install the service
sudo cp "$TMP_SERVICE" /etc/systemd/system/plante-api.service
sudo chmod 644 /etc/systemd/system/plante-api.service
rm "$TMP_SERVICE"

# Reload systemd and enable the service
sudo systemctl daemon-reload
sudo systemctl enable plante-api
sudo systemctl restart plante-api

echo -e "${GREEN}✓${NC} Systemd service installed and started"

# Wait a moment for the service to start
sleep 2

# Check service status
echo -e "\n${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           Setup Complete!              ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"

echo -e "\nService status:"
sudo systemctl status plante-api --no-pager || true

echo -e "\n${GREEN}Useful commands:${NC}"
echo -e "  Check status:   ${YELLOW}sudo systemctl status plante-api${NC}"
echo -e "  View logs:      ${YELLOW}sudo journalctl -u plante-api -f${NC}"
echo -e "  Restart:        ${YELLOW}sudo systemctl restart plante-api${NC}"
echo -e "  Stop:           ${YELLOW}sudo systemctl stop plante-api${NC}"
echo -e "\nAPI will be available at: ${YELLOW}http://$(hostname -I | awk '{print $1}'):8000${NC}"
