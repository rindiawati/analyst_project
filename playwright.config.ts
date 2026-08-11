import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // Run E2E against a production build (`npm run preview` = `next build &&
    // next start`) on port 3001 — more reliable and realistic than `next dev`,
    // which has per-route cold-compilation + an artificial dev delay that make
    // the auth callback flaky on first hit. CI starts its own; reuse any
    // existing 3001 server locally to speed up iteration.
    command: "npm run preview -- --port 3001",
    url: "http://localhost:3001",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
