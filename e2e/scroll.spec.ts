import { test, expect } from "@playwright/test";

// Generate 53 weeks of mock contribution data
function generateMockData() {
  const weeks = [];
  const months: { name: string; firstDay: string }[] = [];
  const days: { date: string; count: number; level: number; weekday: number }[] = [];

  const start = new Date("2024-05-05"); // Start on a Sunday
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let lastMonth = -1;

  for (let w = 0; w < 53; w++) {
    const week = { contributionDays: [] as typeof days };
    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      const count = Math.floor(Math.random() * 12);
      const level = count === 0 ? 0 : count <= 3 ? 1 : count <= 6 ? 2 : count <= 9 ? 3 : 4;
      const dateStr = date.toISOString().slice(0, 10);
      const weekday = d;
      week.contributionDays.push({ date: dateStr, count, level, weekday });
      days.push({ date: dateStr, count, level, weekday });

      if (date.getMonth() !== lastMonth) {
        lastMonth = date.getMonth();
        months.push({ name: monthNames[date.getMonth()], firstDay: dateStr });
      }
    }
    weeks.push(week);
  }

  return {
    profile: {
      login: "testuser",
      name: "Test User",
      avatarUrl: "https://avatars.githubusercontent.com/u/1?v=4",
      bio: "Test bio",
      location: "Tokyo",
      company: "Test Co",
      blog: "",
      publicRepos: 42,
      followers: 100,
      following: 50,
      createdAt: "2020-01-01T00:00:00Z",
    },
    contributions: {
      totalContributions: 1234,
      weeks,
      months,
      days,
    },
    activityOverview: {
      commits: 60,
      pullRequests: 20,
      issues: 10,
      codeReviews: 10,
    },
    contributedRepos: [
      { nameWithOwner: "testuser/repo1", url: "https://github.com/testuser/repo1", count: 50 },
    ],
    contributedOrgs: [],
    remainingRepoCount: 0,
    activityPeriods: [],
    availableYears: [],
  };
}

// A wide mock SVG to simulate a real graph image (700px wide)
const MOCK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="700" height="160" viewBox="0 0 700 160">
  <rect width="700" height="160" fill="#1a0a0f"/>
  <text x="12" y="30" fill="#ebbcba" font-size="13" font-family="monospace">166 (69%) Active Days</text>
  <text x="260" y="30" fill="#ebbcba" font-size="13" font-family="monospace">Daily Avg 3.2</text>
  <text x="490" y="30" fill="#ebbcba" font-size="13" font-family="monospace">Best Day 12</text>
  ${Array.from({ length: 42 }, (_, i) => {
    const col = i % 7;
    const row = Math.floor(i / 7);
    const colors = ["#440015","#882240","#c45a75","#e8a5b5","#f0e8ea"];
    const fill = colors[Math.floor(Math.random() * colors.length)];
    return `<rect x="${col * 60 + 12}" y="${row * 30 + 60}" width="50" height="22" rx="3" fill="${fill}"/>`;
  }).join("")}
  <text x="12" y="155" fill="#ebbcba" font-size="11">Mon</text>
  <text x="72" y="155" fill="#ebbcba" font-size="11">Tue</text>
  <text x="132" y="155" fill="#ebbcba" font-size="11">Wed</text>
  <text x="192" y="155" fill="#ebbcba" font-size="11">Thu</text>
  <text x="252" y="155" fill="#ebbcba" font-size="11">Fri</text>
  <text x="312" y="155" fill="#ebbcba" font-size="11">Sat</text>
  <text x="372" y="155" fill="#ebbcba" font-size="11">Sun</text>
</svg>`;

test.beforeEach(async ({ page }) => {
  const mockData = generateMockData();
  // Intercept the GitHub API call
  await page.route("/api/github/*", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockData),
    });
  });
  // Intercept graph SVG requests so the EmbedBuilder preview renders visually
  await page.route("/graph/**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "image/svg+xml",
      body: MOCK_SVG,
    });
  });
  await page.goto("/");
});

test("contribution graph: left edge is reachable on mobile", async ({ page }) => {
  // Trigger a search to show the graph
  const searchInput = page.locator('input[type="text"], input[placeholder]').first();
  await searchInput.fill("testuser");
  await searchInput.press("Enter");

  // Wait for graph to appear
  await page.waitForSelector(".contrib-graph", { timeout: 5000 });

  // Take a screenshot at initial (scrolled to left)
  await page.screenshot({
    path: "e2e/screenshots/graph-initial.png",
    fullPage: false,
  });

  // Find the scroll container inside the contrib-graph
  const scrollContainer = page.locator(".contrib-graph .overflow-x-auto, .contrib-graph [class*='overflow-x-auto']").first();

  // Get the scrollWidth and clientWidth of the scroll container
  const scrollInfo = await scrollContainer.evaluate((el) => ({
    scrollWidth: el.scrollWidth,
    clientWidth: el.clientWidth,
    scrollLeft: el.scrollLeft,
    // Check if content is wider than container (scroll is needed)
    needsScroll: el.scrollWidth > el.clientWidth,
  }));

  console.log("Scroll container info:", scrollInfo);

  // The graph should be wider than the viewport (needs scrolling)
  expect(scrollInfo.needsScroll).toBe(true);

  // Initially at the left edge
  expect(scrollInfo.scrollLeft).toBe(0);

  // Scroll all the way to the right
  await scrollContainer.evaluate((el) => {
    el.scrollLeft = el.scrollWidth - el.clientWidth;
  });
  await page.waitForTimeout(200);
  await page.screenshot({
    path: "e2e/screenshots/graph-scrolled-right.png",
    fullPage: false,
  });

  // Scroll all the way back to the left
  await scrollContainer.evaluate((el) => {
    el.scrollLeft = 0;
  });
  await page.waitForTimeout(200);
  await page.screenshot({
    path: "e2e/screenshots/graph-scrolled-left.png",
    fullPage: false,
  });

  // Verify we're back at scrollLeft=0 (left edge is reachable)
  const finalScrollLeft = await scrollContainer.evaluate((el) => el.scrollLeft);
  expect(finalScrollLeft).toBe(0);

  // The day label column (Mon, Wed, Fri) should be visible in the viewport
  // when scrolled to the left. The SVG is at the leftmost position.
  const svgBoundingBox = await page.locator(".contrib-graph svg").first().boundingBox();
  const containerBoundingBox = await scrollContainer.boundingBox();

  console.log("SVG bounding box:", svgBoundingBox);
  console.log("Container bounding box:", containerBoundingBox);

  // The SVG left edge should be AT OR INSIDE the container's left boundary
  // (accounting for the small spacer element ~8px)
  if (svgBoundingBox && containerBoundingBox) {
    // Playwright boundingBox() uses .x/.y (not .left/.top)
    const svgLeftRelativeToContainer = svgBoundingBox.x - containerBoundingBox.x;
    console.log("SVG left relative to container:", svgLeftRelativeToContainer);
    // Should be positive (SVG starts inside container, after the left spacer)
    // and small (not hidden off-screen)
    expect(svgLeftRelativeToContainer).toBeGreaterThanOrEqual(0);
    expect(svgLeftRelativeToContainer).toBeLessThan(50); // should be close to the container edge
  }
});

test("embed builder: left edge of graph preview is reachable", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });

  const searchInput = page.locator('input[type="text"], input[placeholder]').first();
  await searchInput.fill("testuser");
  await searchInput.press("Enter");

  await page.waitForSelector(".contrib-graph", { timeout: 5000 });
  await page.waitForTimeout(500);

  // Select "calendar" graph type (like sample2.png) to force wide image
  await page.locator("button", { hasText: "Calendar" }).click();
  await page.waitForTimeout(300);

  // Find the embed builder preview scroll container — it's the overflow-x-auto that contains an img
  const embedScrollContainer = page.locator("div.overflow-x-auto").filter({
    has: page.locator("img"),
  }).first();

  // Scroll the preview into view
  await embedScrollContainer.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  const scrollInfo = await embedScrollContainer.evaluate((el) => ({
    scrollWidth: el.scrollWidth,
    clientWidth: el.clientWidth,
    scrollLeft: el.scrollLeft,
  }));
  console.log("Embed scroll container info:", scrollInfo);

  // Screenshot: initial state (left edge must be fully visible)
  await page.screenshot({ path: "e2e/screenshots/embed-initial-375.png" });

  // Scroll right to the end
  await embedScrollContainer.evaluate((el) => {
    el.scrollLeft = el.scrollWidth - el.clientWidth;
  });
  await page.waitForTimeout(200);
  await page.screenshot({ path: "e2e/screenshots/embed-scrolled-right-375.png" });

  // Scroll back to left
  await embedScrollContainer.evaluate((el) => { el.scrollLeft = 0; });
  await page.waitForTimeout(200);
  await page.screenshot({ path: "e2e/screenshots/embed-scrolled-left-375.png" });

  const finalScrollLeft = await embedScrollContainer.evaluate((el) => el.scrollLeft);
  console.log("Embed final scrollLeft:", finalScrollLeft);
  expect(finalScrollLeft).toBe(0);

  // Inner content div must start at x=0 of scroll container (not behind it)
  const containerBox = await embedScrollContainer.boundingBox();
  const innerBox = await embedScrollContainer.locator("> div").first().boundingBox();
  if (containerBox && innerBox) {
    const innerLeftRelative = innerBox.x - containerBox.x;
    console.log("Inner div left relative to scroll container:", innerLeftRelative);
    expect(innerLeftRelative).toBeGreaterThanOrEqual(0);
    expect(innerLeftRelative).toBeLessThan(5);
  }
});

test("screenshot: mobile graph at 375px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });

  const searchInput = page.locator('input[type="text"], input[placeholder]').first();
  await searchInput.fill("testuser");
  await searchInput.press("Enter");

  await page.waitForSelector(".contrib-graph", { timeout: 5000 });
  await page.waitForTimeout(500);

  // Screenshot at initial position (left edge)
  await page.screenshot({
    path: "e2e/screenshots/mobile-375-initial.png",
    fullPage: false,
  });

  const scrollContainer = page.locator(".contrib-graph .overflow-x-auto, .contrib-graph [class*='overflow-x-auto']").first();

  // Scroll right then back to left
  await scrollContainer.evaluate((el) => { el.scrollLeft = el.scrollWidth; });
  await page.waitForTimeout(200);
  await scrollContainer.evaluate((el) => { el.scrollLeft = 0; });
  await page.waitForTimeout(200);

  await page.screenshot({
    path: "e2e/screenshots/mobile-375-after-scroll-reset.png",
    fullPage: false,
  });

  const scrollLeft = await scrollContainer.evaluate((el) => el.scrollLeft);
  expect(scrollLeft).toBe(0);
});
