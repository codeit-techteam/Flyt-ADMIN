export const env = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "FLYT Admin Console",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  demoMode: (process.env.NEXT_PUBLIC_DEMO_MODE ?? "true") === "true",
  hasBackend: Boolean(process.env.NEXT_PUBLIC_API_BASE_URL),
} as const;
