declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PG_CONNECTION_STRING: string;
      HUB_HTTP_URL: string;
      AIRSTACK_API_KEY: string;
      NEXT_PUBLIC_URL: string;
      VERCEL_ENV: "production" | "development" | "preview";
    }
  }
}

export {};
