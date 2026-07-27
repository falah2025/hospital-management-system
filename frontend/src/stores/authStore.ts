import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { nativeStorage } from "./utils/mobile";

interface User {
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
  setAuth: (user: User, token: string) => void;
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
      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => capacitorStorage),
    }
  )
);
