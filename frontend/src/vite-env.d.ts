/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "virtual:pwa-register" {
  export interface RegisterSWOptions {
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (sw: ServiceWorkerRegistration | undefined) => void;
    onRegisterError?: (error: any) => void;
  }
  export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>;
}
