#!/bin/bash
set -e
cd frontend
npm install
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
echo "📱 Debug APK: android/app/build/outputs/apk/debug/app-debug.apk"
