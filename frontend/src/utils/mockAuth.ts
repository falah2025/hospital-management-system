/**
 * Mock Auth Fallback
 * -------------------
 * Used ONLY when the real backend API is unreachable (e.g. the Capacitor
 * mobile app running on a device without access to the backend server).
 *
 * Verifies login credentials locally against the seeded demo accounts and
 * returns a fake JWT-like token so the rest of the app (guards, API
 * interceptors) continues to work without modification.
 */
import type { User } from "../stores/authStore";

export interface MockAccount {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

// The three seeded demo accounts (must match backend/prisma/seed.ts)
export const DEMO_ACCOUNTS: MockAccount[] = [
  {
    id: "mock-user-admin",
    email: "admin@hospital.com",
    password: "admin123",
    firstName: "مدير",
    lastName: "النظام",
    roles: ["ADMIN"],
  },
  {
    id: "mock-user-doctor",
    email: "doctor@hospital.com",
    password: "doctor123",
    firstName: "د. أحمد",
    lastName: "محمد",
    roles: ["DOCTOR"],
  },
  {
    id: "mock-user-receptionist",
    email: "receptionist@hospital.com",
    password: "reception123",
    firstName: "سارة",
    lastName: "الخالد",
    roles: ["RECEPTIONIST"],
  },
];

// Fake token marker so the API interceptor can recognise offline mode
const MOCK_TOKEN_PREFIX = "mock-jwt-";

/**
 * Try to log in locally. Returns null when the credentials do not match
 * any demo account. Case-insensitive email matching.
 */
export const mockLogin = (
  email: string,
  password: string
): { user: User; token: string } | null => {
  const normalized = email.trim().toLowerCase();
  const account = DEMO_ACCOUNTS.find(
    (a) => a.email.toLowerCase() === normalized && a.password === password
  );
  if (!account) return null;

  const token = `${MOCK_TOKEN_PREFIX}${account.id}-${Date.now()}`;
  const user: User = {
    id: account.id,
    email: account.email,
    firstName: account.firstName,
    lastName: account.lastName,
    roles: account.roles,
  };
  return { user, token };
};

export const isMockToken = (token: string | null): boolean =>
  Boolean(token && token.startsWith(MOCK_TOKEN_PREFIX));
