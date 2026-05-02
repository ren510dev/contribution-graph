import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: "http://localhost:5173",
  },
  webServer: {
    command: "npm run dev:vite",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 30_000,
  },
  projects: [
    {
      name: "mobile-safari",
      use: { ...devices["iPhone SE"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
