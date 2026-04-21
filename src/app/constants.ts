export const isProduction = process.env.VERCEL_ENV === "production";

export const hubHttpUrl = "https://hub.pinata.cloud";
export const hubRequestOptions = undefined;

export const externalBaseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
