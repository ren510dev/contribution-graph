import { expect, test } from "@playwright/test";
import { mockApiError, mockGitHub, search, USERNAME } from "./mock";

test("renders the landing page with a focused search field", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Contribution Graph/);
  await expect(page.getByPlaceholder(/username/i)).toBeFocused();
});

test("renders the profile and the contribution graph for a user", async ({ page }) => {
  await mockGitHub(page);
  await search(page);

  await expect(page.getByText(`@${USERNAME}`).first()).toBeVisible();
  await expect(page.getByText(/contributions in the last year/)).toBeVisible();
  await expect(page.locator("svg rect.contrib-cell").first()).toBeVisible();
});

test("shows an error when the user does not exist", async ({ page }) => {
  await mockApiError(page, 404, "User not found");
  await search(page, "this-user-does-not-exist-zzz999");

  await expect(page.getByText("User not found")).toBeVisible();
});

test("shows an error when the GitHub API rate limit is hit", async ({ page }) => {
  const message = "GitHub API rate limit exceeded. Please wait a moment and try again.";
  await mockApiError(page, 502, message);
  await search(page);

  await expect(page.getByText(message)).toBeVisible();
});
