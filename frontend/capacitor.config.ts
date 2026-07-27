import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.hospital.hms",
  appName: "نظام إدارة المستشفى",
  webDir: "dist",
  server: {
    androidScheme: "https",
    cleartext: true,
  },
  android: {
    buildOptions: {
      keystorePath: "release-key.keystore",
      keystoreAlias: "hms",
      keystorePassword: "hms123456",
      keystoreAliasPassword: "hms123456",
      releaseType: "APK",
    },
    allowMixedContent: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#2563eb",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#2563eb",
    },
  },
};

export default config;
