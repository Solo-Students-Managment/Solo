import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: {
    command: `pnpm exec next dev --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      NEXT_PUBLIC_APP_URL: baseURL,
      NEXT_PUBLIC_API_BASE_URL: "/api",
      NEXT_PUBLIC_ENABLE_MSW: "true",
      NEXT_PUBLIC_ENABLE_DEV_TOOLS: "true",
    },
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Prefer system Chrome when Playwright headless-shell download is blocked.
        channel: "chrome",
      },
    },
  ],
});
