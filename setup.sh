#!/bin/bash
set -e

echo "🏥 HMS Setup Script"
echo "==================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ is required. Current: $(node -v)"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Setup Backend
echo ""
echo -e "${YELLOW}Setting up Backend...${NC}"
cd backend
npm install

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "⚠️  Please edit backend/.env and set your DATABASE_URL"
fi

echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Setup Frontend
echo ""
echo -e "${YELLOW}Setting up Frontend...${NC}"
cd ../frontend
npm install

echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

# Check Android SDK
if [ -z "$ANDROID_HOME" ]; then
    echo ""
    echo -e "${YELLOW}⚠️  ANDROID_HOME is not set${NC}"
    echo "   For APK building, you need Android SDK."
    echo "   Install Android Studio or set ANDROID_HOME manually."
fi

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Edit backend/.env and set DATABASE_URL"
echo "  2. Run: cd backend && npx prisma migrate dev"
echo "  3. Run: cd backend && npm run dev"
echo "  4. Run: cd frontend && npm run dev"
echo ""
echo "For APK building:"
echo "  ./build-apk.sh"
