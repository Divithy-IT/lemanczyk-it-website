import { defineConfig } from "@playwright/test";

const production = process.env.PLAYWRIGHT_PRODUCTION === "1";

export default defineConfig({
  testDir: "./tests/browser",
  webServer: { command: production ? "node scripts/serve-built-site.mjs" : "npm run dev -- --host 127.0.0.1 --port 4173", url: "http://127.0.0.1:4173", reuseExistingServer: false },
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:4173", trace: "retain-on-failure" },
  reporter: "list",
});
