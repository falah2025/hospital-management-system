#!/bin/bash
set -e

echo "🏥 HMS APK Builder"
echo "=================="

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed."; exit 1; }
command -v java >/dev/null 2>&1 || { echo "❌ Java JDK is required but not installed."; exit 1; }

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Step 1: Build web app
echo -e "${GREEN}Step 1/5: Building web app...${NC}"
cd frontend
npm install
npm run build

# Step 2: Sync with Capacitor
echo -e "${GREEN}Step 2/5: Syncing with Capacitor...${NC}"
npx cap sync android

# Step 3: Generate icons (if needed)
echo -e "${GREEN}Step 3/5: Generating app icons...${NC}"
if [ ! -f "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png" ]; then
    echo "⚠️  Please add app icons to android/app/src/main/res/"
fi

# Step 4: Build APK
echo -e "${GREEN}Step 4/5: Building APK...${NC}"
cd android
./gradlew assembleRelease

# Step 5: Output
echo -e "${GREEN}Step 5/5: Done!${NC}"
echo ""
echo "📱 APK Location:"
echo "   frontend/android/app/build/outputs/apk/release/app-release.apk"
echo ""
echo "To install on device:"
echo "   adb install frontend/android/app/build/outputs/apk/release/app-release.apk"
