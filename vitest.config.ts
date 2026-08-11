import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Exclude Playwright E2E specs (run via `npx playwright test`, not vitest)
    // and build output from unit-test discovery.
    exclude: ["**/node_modules/**", "**/dist/**", "**/cypress/**", "**/.{idea,git,cache,output,temp}/**", "**/{karma,rollup,webpack,vite,vitest,jest,babel,browserslist}.config.*", "e2e/**", "playwright.config.ts"],
    coverage: {
      provider: "v8",
    },
  },
});
