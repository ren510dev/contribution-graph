import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Page } from "@playwright/test";

const fixtures = join(dirname(fileURLToPath(import.meta.url)), "fixtures");
const profile = readFileSync(join(fixtures, "profile.json"), "utf-8");
const graph = readFileSync(join(fixtures, "graph.svg"), "utf-8");

export const USERNAME = "ren510dev";

export async function mockGitHub(page: Page) {
  await page.route("**/api/github/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: profile }),
  );
  await page.route("**/graph/**", (route) =>
    route.fulfill({ status: 200, contentType: "image/svg+xml", body: graph }),
  );
}

export async function mockApiError(page: Page, status: number, message: string) {
  await page.route("**/api/github/**", (route) =>
    route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify({ error: message }),
    }),
  );
}

export async function search(page: Page, username = USERNAME) {
  await page.goto("/");
  await page.getByPlaceholder(/username/i).fill(username);
  await page.keyboard.press("Enter");
}
