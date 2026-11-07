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
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator("#game-canvas canvas")).toBeVisible();
  await context.setOffline(false);
});
