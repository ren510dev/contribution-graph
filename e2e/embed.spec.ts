import { expect, test } from "@playwright/test";
import { mockGitHub, search, USERNAME } from "./mock";

const snippet = (page: import("@playwright/test").Page) =>
  page.getByText(new RegExp(`/graph/${USERNAME}/[a-z-]+\\.svg\\?theme=`)).first();

test.beforeEach(async ({ page }) => {
  await mockGitHub(page);
  await search(page);
  await expect(snippet(page)).toBeVisible();
});

test("switching the graph type updates the embed URL", async ({ page }) => {
  await expect(snippet(page)).toContainText("activity-line.svg");

  await page.getByRole("button", { name: "Calendar" }).click();
  await expect(snippet(page)).toContainText("calendar.svg");

  await page.getByRole("button", { name: "Streak" }).click();
  await expect(snippet(page)).toContainText("streak.svg");
});

test("switching the theme updates the embed URL", async ({ page }) => {
  await expect(snippet(page)).toContainText("theme=bordeaux");

  await page.getByRole("button", { name: "Dracula", exact: true }).click();
  await expect(snippet(page)).toContainText("theme=dracula");
});
