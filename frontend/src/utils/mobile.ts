import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import { PushNotifications } from "@capacitor/push-notifications";
import { Preferences } from "@capacitor/preferences";
import { Toast } from "@capacitor/toast";

const isNative = Capacitor.isNativePlatform();

export const initializeMobile = async () => {
  if (!isNative) return;

  try {
    // Status bar
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: "#2563eb" });

    // Hide splash screen
    await SplashScreen.hide({ fadeOutDuration: 500 });

    // Push notifications setup
    await PushNotifications.requestPermissions();
    await PushNotifications.register();

    PushNotifications.addListener("registration", (token) => {
      console.log("Push registration token:", token.value);
      // Send token to backend
    });

    PushNotifications.addListener("pushNotificationReceived", (notification) => {
      Toast.show({
        text: notification.title || "إشعار جديد",
        duration: "long",
      });
    });
  } catch (err) {
    console.error("Mobile init error:", err);
  }
};

// Native storage wrapper
export const nativeStorage = {
  async set(key: string, value: string) {
    if (isNative) {
      await Preferences.set({ key, value });
    } else {
      localStorage.setItem(key, value);
    }
  },
  async get(key: string): Promise<string | null> {
    if (isNative) {
      const { value } = await Preferences.get({ key });
      return value;
    }
    return localStorage.getItem(key);
  },
  async remove(key: string) {
    if (isNative) {
      await Preferences.remove({ key });
    } else {
      localStorage.removeItem(key);
    }
  },
};

// Show native toast
export const showToast = async (message: string) => {
  if (isNative) {
    await Toast.show({ text: message, duration: "short" });
  }
};

export { isNative };
