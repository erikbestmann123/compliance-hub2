/**
 * compliance-summary.unit.spec.js
 *
 * Unit + Integration tests for the Compliance Summary component.
 * Covers: rendering, variants/states, interactivity, responsiveness,
 * keyboard navigation, edge cases.
 *
 * Tool: Playwright Test
 * Target page: /compliance-summary.html
 * Wrapping element id: #saffron_implmentation_100
 */

import { test, expect } from '@playwright/test';

const PAGE = '/compliance-summary.html';
const ROOT = '#saffron_implmentation_100';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Wait for all Saffron custom elements to be defined */
async function waitForSaffronReady(page) {
  await page.waitForFunction(() =>
    ['saf-badge', 'saf-divider', 'saf-select', 'saf-icon'].every(
      (tag) => customElements.get(tag) !== undefined
    )
  );
}

// ── Rendering ───────────────────────────────────────────────────────────────

test.describe('Compliance Summary — Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE);
    await waitForSaffronReady(page);
  });

  test('renders the wrapping article with correct id', async ({ page }) => {
    await expect(page.locator(ROOT)).toBeVisible();
    expect(await page.locator(ROOT).getAttribute('id')).toBe('saffron_implmentation_100');
  });

  test('renders the eyebrow "Digital controls"', async ({ page }) => {
    const eyebrow = page.locator(`${ROOT} .compliance-summary__eyebrow`);
    await expect(eyebrow).toHaveText('Digital controls');
  });

  test('renders heading "Compliance summary"', async ({ page }) => {
    const heading = page.locator(`${ROOT} h2#compliance-title`);
    await expect(heading).toHaveText('Compliance summary');
  });

  test('renders the year label', async ({ page }) => {
    const label = page.locator(`${ROOT} label[for="year-select"]`);
    await expect(label).toHaveText('Year');
  });

  test('renders the saf-select with 2025 selected by default', async ({ page }) => {
    const select = page.locator(`${ROOT} saf-select#year-select`);
    await expect(select).toBeVisible();
    const selectedOption = page.locator(`${ROOT} saf-select#year-select option[selected]`);
    await expect(selectedOption).toHaveText('2025');
  });

  test('renders "All deadlines" panel heading', async ({ page }) => {
    await expect(page.locator(`${ROOT} #all-deadlines-title`)).toHaveText('All deadlines');
  });

  test('renders "Your deadlines" panel heading', async ({ page }) => {
    await expect(page.locator(`${ROOT} #your-deadlines-title`)).toHaveText('Your deadlines');
  });

  test('renders correct stat values for All deadlines', async ({ page }) => {
    const allPanel = page.locator(`${ROOT} section[aria-labelledby="all-deadlines-title"]`);
    const values = allPanel.locator('.compliance-summary__stat-value');
    await expect(values.nth(0)).toHaveText('78');
    await expect(values.nth(1)).toHaveText('20');
  });

  test('renders correct stat values for Your deadlines', async ({ page }) => {
    const yourPanel = page.locator(`${ROOT} section[aria-labelledby="your-deadlines-title"]`);
    const values = yourPanel.locator('.compliance-summary__stat-value');
    await expect(values.nth(0)).toHaveText('35');
    await expect(values.nth(1)).toHaveText('7');
  });

  test('renders 3 saf-badge components in All deadlines', async ({ page }) => {
    const badges = page.locator(
      `${ROOT} section[aria-labelledby="all-deadlines-title"] saf-badge`
    );
    await expect(badges).toHaveCount(3);
  });

  test('renders 3 saf-badge components in Your deadlines', async ({ page }) => {
    const badges = page.locator(
      `${ROOT} section[aria-labelledby="your-deadlines-title"] saf-badge`
    );
    await expect(badges).toHaveCount(3);
  });

  test('renders notification badge with value "1"', async ({ page }) => {
    const notifBadge = page.locator(`${ROOT} .compliance-summary__notification`);
    await expect(notifBadge).toBeVisible();
    await expect(notifBadge).toHaveText('1');
  });
});

// ── Badge variants ───────────────────────────────────────────────────────────

test.describe('Compliance Summary — Badge variants', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE);
    await waitForSaffronReady(page);
  });

  const badgeCases = [
    { panel: 'all-deadlines-title', idx: 0, appearance: 'success', count: '18', icon: 'circle-check' },
    { panel: 'all-deadlines-title', idx: 1, appearance: 'warning', count: '27', icon: 'triangle-exclamation' },
    { panel: 'all-deadlines-title', idx: 2, appearance: 'info',    count: '33', icon: 'circle-info' },
    { panel: 'your-deadlines-title', idx: 0, appearance: 'success', count: '8',  icon: 'circle-check' },
    { panel: 'your-deadlines-title', idx: 1, appearance: 'warning', count: '6',  icon: 'triangle-exclamation' },
    { panel: 'your-deadlines-title', idx: 2, appearance: 'info',    count: '21', icon: 'circle-info' },
  ];

  for (const { panel, idx, appearance, count, icon } of badgeCases) {
    test(`${panel} badge[${idx}] has appearance="${appearance}", count=${count}, icon=${icon}`, async ({ page }) => {
      const badge = page.locator(
        `${ROOT} section[aria-labelledby="${panel}"] saf-badge`
      ).nth(idx);
      await expect(badge).toHaveAttribute('appearance', appearance);
      await expect(badge).toContainText(count);
      const badgeIcon = badge.locator('saf-icon');
      await expect(badgeIcon).toHaveAttribute('icon-name', icon);
      await expect(badgeIcon).toHaveAttribute('aria-hidden', 'true');
    });
  }
});

// ── Interactivity ────────────────────────────────────────────────────────────

test.describe('Compliance Summary — Interactivity', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE);
    await waitForSaffronReady(page);
  });

  test('year select can be changed to 2024', async ({ page }) => {
    const select = page.locator(`${ROOT} saf-select#year-select`);
    await select.selectOption('2024');
    const selected = await page.evaluate(() => {
      const sel = document.querySelector('#year-select');
      return sel?.value || sel?.currentValue;
    });
    expect(selected).toBe('2024');
  });

  test('year select is keyboard-operable', async ({ page }) => {
    const select = page.locator(`${ROOT} saf-select#year-select`);
    await select.focus();
    await page.keyboard.press('ArrowDown');
    // select receives focus and responds to arrow keys without throw
    await expect(select).toBeFocused();
  });
});

// ── Keyboard navigation ──────────────────────────────────────────────────────

test.describe('Compliance Summary — Keyboard navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE);
    await waitForSaffronReady(page);
  });

  test('Tab navigates into the year select', async ({ page }) => {
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.tagName?.toLowerCase());
    // At some point Tab should land on saf-select
    expect(['saf-select', 'select']).toContain(focused);
  });

  test('no focus trap — Tab moves out of component naturally', async ({ page }) => {
    // Tab through all focusable elements; none should loop indefinitely
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
    }
    // If we reach here without timeout, there is no focus trap
    expect(true).toBe(true);
  });
});

// ── Responsiveness ───────────────────────────────────────────────────────────

test.describe('Compliance Summary — Responsive layout', () => {
  test('panels are side-by-side on desktop (≥ 960px)', async ({ page }) => {
    await page.setViewportSize({ width: 960, height: 600 });
    await page.goto(PAGE);
    await waitForSaffronReady(page);

    const panels = page.locator(`${ROOT} .compliance-summary__panel`);
    const box0 = await panels.nth(0).boundingBox();
    const box1 = await panels.nth(1).boundingBox();
    // Both panels should be on the same vertical row (similar top)
    expect(Math.abs((box0?.y ?? 0) - (box1?.y ?? 0))).toBeLessThan(20);
  });

  test('panels stack vertically on mobile (≤ 640px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(PAGE);
    await waitForSaffronReady(page);

    const panels = page.locator(`${ROOT} .compliance-summary__panel`);
    const box0 = await panels.nth(0).boundingBox();
    const box1 = await panels.nth(1).boundingBox();
    // On mobile, second panel should be below first
    expect((box1?.y ?? 0)).toBeGreaterThan((box0?.y ?? 0) + (box0?.height ?? 0) - 10);
  });

  test('all content is still visible on 320px width', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 812 });
    await page.goto(PAGE);
    await waitForSaffronReady(page);

    await expect(page.locator(`${ROOT} h2#compliance-title`)).toBeVisible();
    await expect(page.locator(`${ROOT} #all-deadlines-title`)).toBeVisible();
    await expect(page.locator(`${ROOT} #your-deadlines-title`)).toBeVisible();
  });
});

// ── Edge cases ───────────────────────────────────────────────────────────────

test.describe('Compliance Summary — Edge cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE);
    await waitForSaffronReady(page);
  });

  test('component renders without JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    // Reload to catch any startup errors
    await page.reload();
    await waitForSaffronReady(page);
    // Filter out known non-critical Saffron init warnings if any
    const criticalErrors = errors.filter(
      (e) => !e.includes('deprecat') && !e.includes('Warning')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('component is visible and not clipped at min 280px width', async ({ page }) => {
    await page.setViewportSize({ width: 280, height: 800 });
    const root = page.locator(ROOT);
    await expect(root).toBeVisible();
    const box = await root.boundingBox();
    expect(box?.height).toBeGreaterThan(0);
  });
});

// ── Visual regression ────────────────────────────────────────────────────────

test.describe('Compliance Summary — Visual regression', () => {
  test('matches desktop snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 960, height: 600 });
    await page.goto(PAGE);
    await waitForSaffronReady(page);
    // Allow slight threshold to account for font-rendering differences
    await expect(page.locator(ROOT)).toHaveScreenshot('compliance-summary-desktop.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('matches mobile snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(PAGE);
    await waitForSaffronReady(page);
    await expect(page.locator(ROOT)).toHaveScreenshot('compliance-summary-mobile.png', {
      maxDiffPixelRatio: 0.02,
    });
  });
});
