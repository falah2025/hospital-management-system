import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Capacitor } from "@capacitor/core";
import { nativeStorage } from "../utils/mobile";
import { mockLogin, isMockToken } from "../utils/mockAuth";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isOfflineMode: boolean;
  setAuth: (user: User, token: string, offlineMode?: boolean) => void;
  logout: () => void;
}

// Custom storage adapter for Capacitor
const capacitorStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return await nativeStorage.get(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await nativeStorage.set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await nativeStorage.remove(name);
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isOfflineMode: false,
      setAuth: (user, token, offlineMode = false) => {
        set({
          user,
          token,
          isAuthenticated: true,
          isOfflineMode: offlineMode || isMockToken(token),
        });
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, isOfflineMode: false });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => capacitorStorage),
    }
  )
);

/**
 * Try the real backend login first; if the request fails (network error,
 * timeout) OR we are running inside Capacitor without a reachable API,
 * fall back to local mock authentication so the app stays fully usable
 * on the device.
 */
export const loginWithFallback = async (email: string, password: string) => {
  // 1. Attempt real backend login
  try {
    const { api } = await import("../utils/api");
    const resp = await api.post("/auth/login", { email, password });
    const { token, user } = resp.data.data;
    useAuthStore.getState().setAuth(user as User, token as string, false);
    return { success: true, offline: false };
  } catch (err: any) {
    const isNetworkError = !err?.response; // no HTTP response = connectivity failure
    if (!isNetworkError) {
      // Server replied (e.g. 401 invalid credentials) — do not fall back
      return { success: false, offline: false };
    }
  }

  // 2. Offline fallback: local mock authentication (works in Capacitor)
  const isNative = Capacitor.isNativePlatform();
  if (isNative) {
    const result = mockLogin(email, password);
    if (result) {
      useAuthStore.getState().setAuth(result.user, result.token, true);
      return { success: true, offline: true };
    }
  }

  return { success: false, offline: false };
};
