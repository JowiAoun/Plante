#!/bin/bash
# ============================================================================
# Plante MongoDB Setup Script
# ============================================================================
# 
# This script sets up the MongoDB database for the Plante application by:
#   1. Creating required database indexes for optimal query performance
#   2. Seeding achievement definitions
#
# Prerequisites:
#   - Node.js installed
#   - MONGODB_URI configured in .env file
#   - npm dependencies installed (npm install)
#
# Usage:
#   chmod +x setup.sh
#   ./setup.sh
#
# ============================================================================

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "🌱 Plante MongoDB Setup"
echo "========================"
echo ""

# Check if .env file exists and has MONGODB_URI
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "   Please create a .env file with MONGODB_URI"
    echo "   You can copy .env.example as a template:"
    echo "   cp .env.example .env"
    exit 1
fi

if ! grep -q "MONGODB_URI=" .env; then
    echo -e "${RED}❌ Error: MONGODB_URI not found in .env${NC}"
    echo "   Please add your MongoDB connection string to .env"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Load environment variables from .env
set -a
source .env
set +a

# Step 1: Create indexes
echo -e "${YELLOW}📇 Creating database indexes...${NC}"
npx tsx scripts/db/create-indexes.ts

echo ""

# Step 2: Seed achievements
echo -e "${YELLOW}🏆 Seeding achievements...${NC}"
npx tsx scripts/db/seed-achievements.ts

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Start the dev server: npm run dev"
echo "  2. Navigate to http://localhost:3000"
echo "  3. Sign in with Google to create your user account"
echo ""
