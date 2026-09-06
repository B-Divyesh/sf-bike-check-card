import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';

const sampleBike = 'Steel commuter, 700c';
const pngPhoto = readFileSync('public/icon-192.png');
const jpgPhoto = readFileSync('public/assets/social-card.jpg');
const photoSizeLimit = 10 * 1024 * 1024;

const pngPayload = (name: string) => ({ name, mimeType: 'image/png', buffer: pngPhoto });

function paddedJpg(size: number, name: string) {
  const buffer = Buffer.alloc(size);
  jpgPhoto.copy(buffer);
  return { name, mimeType: 'image/jpeg', buffer };
}

test('@claim:core-capture opens a completed bike-fault record', async ({ page }) => {
  await page.goto('/demo');
  await expect(page).toHaveTitle('Demo — Bike Check Card');
  await expect(page.locator('#field-bike')).toHaveValue(sampleBike);
  await expect(page.locator('#field-component')).toHaveValue('Sensor / computer');
  await expect(page.locator('#field-symptom')).toHaveValue(/Wheel speed drops/);
  await expect(page.locator('#field-mileage')).toHaveValue('6,420 km');
  await expect(page.locator('#field-pressure')).toHaveValue(/62 psi/);
  await expect(page.locator('#field-wheelSpeed')).toHaveValue('7 km/h');
  await expect(page.locator('#field-gpsSpeed')).toHaveValue('28 km/h');
  await expect(page.getByAltText(/Sensor and magnet gap circled in red/)).toBeVisible();
  await expect(page.getByText('4 / 4')).toBeVisible();
});

test('@claim:demo-isolation resets only the separate demo workspace', async ({ page }) => {
  await page.goto('/card');
  await page.locator('#field-bike').fill('My real touring bike');
  await page.waitForTimeout(400);
  await page.goto('/?demo=1');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('#field-bike')).toHaveValue(sampleBike);
  await page.locator('#field-bike').fill('Changed demo bike');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('#field-bike')).toHaveValue(sampleBike);
  const databases = await page.evaluate(async () => (await indexedDB.databases()).map(item => item.name).sort());
  expect(databases).toEqual(['bike-check-card', 'demo:bike-check-card']);
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/card$/);
  await expect(page.locator('#field-bike')).toHaveValue('My real touring bike');
});

test('@claim:no-account completes the sample flow without sign-in', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByRole('link', { name: /sign in|log in|create account/i })).toHaveCount(0);
  await expect(page.locator('input[type="email"], input[type="password"]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Copy private link' })).toBeEnabled();
});

test('@claim:local-save restores a real draft after reload', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('link', { name: 'Start for real' }).click();
  await page.locator('#field-bike').fill('Offline tourer');
  await page.locator('#field-component').selectOption('Brakes');
  await page.waitForTimeout(500);
  await page.reload();
  await expect(page.locator('#field-bike')).toHaveValue('Offline tourer');
  await expect(page.locator('#field-component')).toHaveValue('Brakes');
});

test('@claim:offline-reload reloads the completed demo offline', async ({ page, context }) => {
  await page.goto('/demo');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText(/Offline — your card still works/)).toBeVisible();
  await expect(page.locator('#field-bike')).toHaveValue(sampleBike);
  await page.locator('#field-pressure').fill('60 psi');
  await expect(page.locator('#field-pressure')).toHaveValue('60 psi');
});

test('@claim:photo-local adds and marks a photo without uploading it', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto('/demo');
  await page.locator('#photo-input').setInputFiles('public/icon-192.png');
  await expect(page.getByAltText(/Fault evidence photo 2/)).toBeVisible();
  await page.getByRole('button', { name: 'Mark photo' }).nth(1).click();
  const canvas = page.locator('#annotation-canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Annotation canvas is not visible.');
  await page.mouse.move(box.x + 20, box.y + 20);
  await page.mouse.down();
  await page.mouse.move(box.x + 80, box.y + 80);
  await page.mouse.up();
  await page.getByRole('button', { name: 'Save marked photo' }).click();
  await expect(page.getByText('Marked photo saved.')).toBeVisible();
  const stored = await page.evaluate(async () => new Promise<{ dataUrl: string; annotatedDataUrl?: string }>((resolve, reject) => {
    const request = indexedDB.open('demo:bike-check-card');
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const get = request.result.transaction('drafts').objectStore('drafts').get('current');
      get.onerror = () => reject(get.error);
      get.onsuccess = () => resolve(get.result.photos[1]);
    };
  }));
  expect(stored.dataUrl).toMatch(/^data:image\/webp;base64,/);
  expect(stored.annotatedDataUrl).toMatch(/^data:image\/webp;base64,/);
  const origin = new URL(page.url()).origin;
  expect(requests.every(value => new URL(value).origin === origin)).toBe(true);
});

test('@claim:share-prerequisites blocks incomplete cards and shares at the exact minimum', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/demo');
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'New blank card' }).click();
  await expect(page.getByText('0 / 4')).toBeVisible();

  await page.getByRole('button', { name: 'Copy private link' }).click();
  await expect(page.locator('#action-error')).toHaveText('Add the bike, component, symptom and at least one measurement before sharing.');

  await page.locator('#field-bike').fill('Repair test commuter');
  await page.locator('#field-component').selectOption('Brakes');
  await page.locator('#field-symptom').fill('Front brake rubs once per wheel turn.');
  await expect(page.getByText('3 / 4')).toBeVisible();
  await page.getByRole('button', { name: 'Copy private link' }).click();
  await expect(page.locator('#action-error')).toContainText('at least one measurement');

  await page.locator('#field-mileage').fill('0 km');
  await expect(page.getByText('4 / 4')).toBeVisible();
  await page.getByRole('button', { name: 'Copy private link' }).click();
  await expect(page.getByText('Private text link copied. Photos stayed on this device.')).toBeVisible();
  const sharedUrl = await page.evaluate(() => navigator.clipboard.readText());
  await page.goto(sharedUrl);
  await expect(page.getByRole('heading', { name: 'Brakes check' })).toBeVisible();
  await expect(page.getByText('Front brake rubs once per wheel turn.')).toBeVisible();
});

test('@claim:six-photo-limit rejects a seventh photo and accepts a replacement', async ({ page }) => {
  await page.goto('/demo');
  await page.locator('#photo-input').setInputFiles(Array.from({ length: 5 }, (_, index) => pngPayload(`limit-${index + 2}.png`)));
  await expect(page.locator('.photo-card')).toHaveCount(6);

  await page.locator('#photo-input').setInputFiles(pngPayload('seventh.png'));
  await expect(page.locator('#photo-error')).toHaveText('Choose no more than six photos in total.');
  await expect(page.locator('.photo-card')).toHaveCount(6);

  page.once('dialog', dialog => dialog.accept());
  await page.locator('.photo-card').last().getByRole('button', { name: 'Remove' }).click();
  await expect(page.locator('.photo-card')).toHaveCount(5);
  await page.locator('#photo-input').setInputFiles(pngPayload('replacement.png'));
  await expect(page.locator('.photo-card')).toHaveCount(6);
  await expect(page.getByText('1 photo added locally.')).toBeVisible();
});

test('@claim:photo-formats adds JPG and PNG, rejects text, and recovers', async ({ page }) => {
  await page.goto('/demo');
  await page.locator('#photo-input').setInputFiles(pngPayload('evidence.png'));
  await expect(page.locator('.photo-card')).toHaveCount(2);
  await page.locator('#photo-input').setInputFiles({ name: 'evidence.jpg', mimeType: 'image/jpeg', buffer: jpgPhoto });
  await expect(page.locator('.photo-card')).toHaveCount(3);

  await page.locator('#photo-input').setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('not a photo') });
  await expect(page.locator('#photo-error')).toHaveText('notes.txt is not an image.');
  await expect(page.locator('.photo-card')).toHaveCount(3);

  await page.locator('#photo-input').setInputFiles(pngPayload('recovered.png'));
  await expect(page.locator('.photo-card')).toHaveCount(4);
  await expect(page.getByText('1 photo added locally.')).toBeVisible();
});

test('@claim:photo-size-limit accepts exactly 10 MB, rejects one byte more, and recovers', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('/demo');
  await page.locator('#photo-input').setInputFiles(paddedJpg(photoSizeLimit, 'exactly-10mb.jpg'));
  await expect(page.locator('.photo-card')).toHaveCount(2);

  await page.locator('#photo-input').setInputFiles(paddedJpg(photoSizeLimit + 1, 'over-10mb.jpg'));
  await expect(page.locator('#photo-error')).toHaveText('over-10mb.jpg is larger than 10 MB.');
  await expect(page.locator('.photo-card')).toHaveCount(2);

  await page.locator('#photo-input').setInputFiles(pngPayload('after-size-error.png'));
  await expect(page.locator('.photo-card')).toHaveCount(3);
  await expect(page.getByText('1 photo added locally.')).toBeVisible();
});

test('@claim:fragment-share creates a text-only fragment link', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Copy private link' }).click();
  const sharedUrl = await page.evaluate(() => navigator.clipboard.readText());
  expect(sharedUrl).toMatch(/^http:\/\/127\.0\.0\.1:4173\/#card=/);
  expect(sharedUrl).not.toContain('demo-sensor');
  expect(sharedUrl).not.toContain('data:image');
  let documentRequest = '';
  page.on('request', request => { if (request.isNavigationRequest()) documentRequest = request.url(); });
  await page.goto(sharedUrl);
  expect(documentRequest).not.toContain('#card=');
  await expect(page.getByText(/1 local photo was not included/)).toBeVisible();
});

test('@claim:json-backup exports and restores the complete demo card', async ({ page }) => {
  await page.goto('/demo');
  await page.locator('#field-bike').fill('Restorable sample bike');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export backup' }).click();
  const download = await downloadPromise;
  const backupPath = await download.path();
  if (!backupPath) throw new Error('Backup download has no local path.');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('#field-bike')).toHaveValue(sampleBike);
  page.once('dialog', dialog => dialog.accept());
  await page.locator('#import-json').setInputFiles(backupPath);
  await expect(page.locator('#field-bike')).toHaveValue('Restorable sample bike');
  await expect(page.getByAltText(/Sensor and magnet gap circled in red/)).toBeVisible();
});

test('@claim:same-origin keeps the whole demo flow on the product origin', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.locator('#field-notes').fill('No external request should carry this note.');
  await page.getByRole('button', { name: 'Save to my cards' }).click();
  await page.waitForTimeout(300);
  const origin = new URL(page.url()).origin;
  expect(requests.length).toBeGreaterThan(0);
  expect(requests.filter(value => new URL(value).origin !== origin)).toEqual([]);
});

test('@claim:safety-boundary never presents the card as a diagnosis', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'This card is not safety advice' })).toBeVisible();
  await expect(page.getByText('It does not diagnose faults or tell you a bike is safe to ride.')).toBeVisible();
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: 'This card cannot tell you the bike is safe.' })).toBeVisible();
  await expect(page.getByRole('button', { name: /diagnose|safe to ride|replacement/i })).toHaveCount(0);
});

test('@claim:free-use exposes no checkout or payment prompt', async ({ page }) => {
  for (const path of ['/', '/demo', '/card', '/cards']) {
    await page.goto(path);
    await expect(page.locator('a[href*="checkout"], a[href*="api.sociobot.in"]')).toHaveCount(0);
    await expect(page.getByText(/\$9|buy supporter|payment|subscription/i)).toHaveCount(0);
  }
});

test('@claim:print-card sends the completed demo to browser print', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'print', { value: () => { (window as Window & { printCalled?: boolean }).printCalled = true; } });
  });
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Print / save PDF' }).click();
  expect(await page.evaluate(() => Boolean((window as Window & { printCalled?: boolean }).printCalled))).toBe(true);
});

test('routes set titles, metadata, focus, history, and direct URLs', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Bike Check Card — record bike-fault evidence');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'http://127.0.0.1:4173/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /social-card\.jpg$/);
  await page.getByRole('link', { name: 'Try demo' }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.locator('h1')).toBeFocused();
  await expect(page).toHaveTitle('Demo — Bike Check Card');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /separate sample workspace/);
  await page.goBack();
  await expect(page).toHaveURL('http://127.0.0.1:4173/');
  await expect(page.locator('h1')).toBeFocused();
  await page.goForward();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.locator('h1')).toBeFocused();
  await page.goto('/privacy');
  await expect(page).toHaveTitle('Privacy — Bike Check Card');
  await page.goto('/terms');
  await expect(page).toHaveTitle('Terms — Bike Check Card');
});

test('has no serious accessibility violations or console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', error => errors.push(error.message));
  for (const path of ['/', '/demo', '/card', '/cards', '/privacy', '/terms', '/missing-page']) {
    await page.goto(path);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
    const results = await new AxeBuilder({ page: page as never }).analyze();
    expect(results.violations.filter(item => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  }
  expect(errors).toEqual([]);
});

test('keeps keyboard access, mobile layout, and reduced motion intact', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skipLink = page.getByRole('link', { name: 'Skip to main content' });
  await expect(skipLink).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const duration = await page.locator('.button').first().evaluate(element => getComputedStyle(element).transitionDuration);
  expect(Number.parseFloat(duration)).toBeLessThanOrEqual(0.00001);
});
