import { expect, test } from "@playwright/test";

test("loads the game board and primary controls", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Traffic Escape 3D/);
  await expect(page.locator("#game-canvas canvas")).toBeVisible();
  await expect(page.locator("#move-count")).toHaveText("0");
  await expect(page.locator("#pause-button")).toBeVisible();
  await expect(page.locator("#hint-button")).toBeVisible();
});

test("opens and closes settings", async ({ page }) => {
  await page.goto("/");
  const dialog = page.locator("#settings-modal");
  await page.locator("#settings-open").click();
  await expect(dialog).toBeVisible();
  await page.locator("#settings-close").click();
  await expect(dialog).toBeHidden();
});

test("pauses and resumes gameplay", async ({ page }) => {
  await page.goto("/");
  const dialog = page.locator("#pause-modal");
  await page.locator("#pause-button").click();
  await expect(dialog).toBeVisible();
  await page.locator("#resume-button").click();
  await expect(dialog).toBeHidden();
});

test("level picker exposes the first level and keeps locked levels disabled", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#level-picker button")).toHaveCount(20);
  await expect(page.locator("#level-picker button").nth(0)).toBeEnabled();
  await expect(page.locator("#level-picker button").nth(1)).toBeDisabled();
});

test("renders within a narrow mobile viewport without horizontal page overflow", async ({ page }) => {
  await page.goto("/");
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
    board: document.querySelector(".board-frame")?.getBoundingClientRect().width ?? 0
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
  expect(dimensions.board).toBeGreaterThan(250);
});

test("service worker installs and the app shell remains available offline", async ({ page, context }) => {
  await page.goto("/");
  await page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) throw new Error("Service workers are unavailable");
    await navigator.serviceWorker.ready;
  });
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true);
  const precache = await page.evaluate(async () => {
    const manifest = await fetch("/manifest.json").then(response => response.json());
    const jsAssets = Object.values(manifest).map((entry: any) => entry.file as string).filter(file => file.endsWith(".js"));
    const cacheNames = await caches.keys();
    const cachedAssets: string[] = [];
    for (const name of cacheNames) {
      const cache = await caches.open(name);
      for (const asset of jsAssets) if (await cache.match("/" + asset)) cachedAssets.push(asset);
    }
    return { jsAssets, cachedAssets };
  });
  expect(precache.jsAssets.length).toBeGreaterThan(0);
  expect(precache.cachedAssets.length).toBe(precache.jsAssets.length);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator("#game-canvas canvas")).toBeVisible();
  await context.setOffline(false);
});

test("hint provides a legal next-step instruction without moving a vehicle", async ({ page }) => {
  await page.goto("/");
  const status = page.locator("#status-message");
  await page.locator("#hint-button").click();
  await expect(status).toContainText(/^Hint: slide the .+ one space (forward|backward)\.$/);
  await expect(page.locator("#move-count")).toHaveText("0");
});

test("restores unlocked world progress from this device", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("traffic-escape-3d-progress-v1", JSON.stringify({
      highestUnlockedLevel: 21,
      completedLevels: Array.from({ length: 20 }, (_, index) => index + 1)
    }));
  });
  await page.goto("/");
  const worldTwo = page.getByRole("button", { name: "Busy Roads, available" });
  await expect(worldTwo).toBeEnabled();
  await worldTwo.click();
  await expect(page.locator(".progress-heading span")).toContainText("WORLD 2");
  await expect(page.locator("#level-picker button").first()).toBeEnabled();
  await expect(page.locator("#level-picker button").first()).toHaveAttribute("aria-label", "Level 21: Four Way Stop");
});

test("undo and restart controls handle an untouched level safely", async ({ page }) => {
  await page.goto("/");
  const status = page.locator("#status-message");
  await page.locator("#undo-button").click();
  await expect(status).toHaveText("No move to undo yet");
  await page.locator("#restart-button").click();
  await expect(page.locator("#move-count")).toHaveText("0");
  await expect(status).toHaveText("Drag a vehicle to move it");
});

test("world selector keeps later worlds locked until their first level is unlocked", async ({ page }) => {
  await page.goto("/");
  const tabs = page.locator("#world-selector button");
  await expect(tabs).toHaveCount(5);
  await expect(tabs.nth(0)).toBeEnabled();
  for (let index = 1; index < 5; index++) {
    await expect(tabs.nth(index)).toBeDisabled();
  }
});

