export const isProduction = process.env.VERCEL_ENV === "production";

const fallbackHubHttpUrl = isProduction
  ? undefined
  : "http://localhost:3010/hub";

const airstackApiKey = process.env.AIRSTACK_API_KEY;

export const hubHttpUrl = airstackApiKey
  ? "https://hubs.airstack.xyz"
  : process.env.HUB_HTTP_URL || fallbackHubHttpUrl;
export const hubRequestOptions = airstackApiKey
  ? {
      headers: { "x-airstack-hubs": airstackApiKey },
    }
  : undefined;

export const externalBaseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
