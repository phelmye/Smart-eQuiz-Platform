// Type definitions for environment variables

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_EXCHANGERATE_API_KEY?: string;
      EXCHANGERATE_API_KEY?: string;
      VITE_EXCHANGERATE_API_KEY?: string;
    }
  }
  
  interface ImportMetaEnv {
    readonly VITE_EXCHANGERATE_API_KEY?: string;
    readonly VITE_API_URL?: string;
    readonly VITE_PLATFORM_DOMAIN?: string;
    readonly VITE_TENANT_MODE?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};
