import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('creates a complete local card and restores it after reload', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Catch the fault');
  await page.getByRole('link', { name: /start a check card/i }).click();
  await page.locator('#field-bike').fill('Steel commuter, 700c');
  await page.locator('#field-component').selectOption('Sensor / computer');
  await page.locator('#field-symptom').fill('Wheel speed drops to 7 km/h while GPS remains steady.');
  await page.locator('#field-wheelSpeed').fill('7 km/h');
  await page.locator('#field-gpsSpeed').fill('28 km/h');
  await expect(page.getByText('4 / 4')).toBeVisible();
  await page.waitForTimeout(400);
  await page.reload();
  await expect(page.locator('#field-bike')).toHaveValue('Steel commuter, 700c');
  await expect(page.locator('#field-symptom')).toHaveValue(/Wheel speed drops/);
});

test('adds and opens a photo annotation canvas', async ({ page }) => {
  await page.goto('/?edit=1');
  await page.locator('#photo-input').setInputFiles('public/icon-192.png');
  await expect(page.getByAltText(/Fault evidence photo 1/)).toBeVisible();
  await page.getByRole('button', { name: 'Mark photo' }).click();
  await expect(page.getByRole('dialog', { name: 'Mark the evidence' })).toBeVisible();
  const canvas = page.locator('#annotation-canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Annotation canvas is not visible.');
  await page.mouse.move(box.x + 20, box.y + 20);
  await page.mouse.down();
  await page.mouse.move(box.x + 80, box.y + 80);
  await page.mouse.up();
  await page.getByRole('button', { name: 'Save marked photo' }).click();
  await expect(page.getByText('Marked photo saved.')).toBeVisible();
});

test('has no serious accessibility violations on the home and editor screens', async ({ page }) => {
  for (const path of ['/', '/?edit=1', '/privacy', '/terms']) {
    await page.goto(path);
    await expect(page.locator('h1')).toHaveCount(1);
    const results = await new AxeBuilder({ page: page as never }).analyze();
    expect(results.violations.filter(item => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  }
});

test('loads and keeps editing when offline after the first visit', async ({ page, context }) => {
  await page.goto('/?edit=1');
  await page.locator('#field-bike').fill('Offline tourer');
  await page.waitForTimeout(800);
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText(/Offline — your draft still saves/)).toBeVisible();
  await expect(page.locator('#field-bike')).toHaveValue('Offline tourer');
  await page.locator('#field-pressure').fill('52 psi');
  await expect(page.locator('#field-pressure')).toHaveValue('52 psi');
});
