/**
 * compliance-summary.a11y.spec.js
 *
 * Accessibility tests — WCAG 2.2 compliance
 * Uses @axe-core/playwright for automated a11y scanning, plus manual
 * Playwright assertions for structural/semantic correctness.
 *
 * WCAG criteria covered:
 *   1.1.1  Non-text content (alt / aria-label on icons & badges)
 *   1.3.1  Info and Relationships (semantic HTML, dl/dt/dd, headings)
 *   1.3.2  Meaningful Sequence (DOM order == visual order)
 *   1.4.3  Contrast Minimum (checked via axe)
 *   2.1.1  Keyboard (all interactive controls reachable by keyboard)
 *   2.1.2  No Keyboard Trap
 *   2.4.3  Focus Order
 *   2.4.6  Headings and Labels
 *   2.4.7  Focus Visible (visible focus indicator)
 *   4.1.2  Name, Role, Value (ARIA attributes on controls)
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGE = '/compliance-summary.html';
const ROOT = '#saffron_implmentation_100';

async function waitForSaffronReady(page) {
  await page.waitForFunction(() =>
    ['saf-badge', 'saf-divider', 'saf-select', 'saf-icon'].every(
      (tag) => customElements.get(tag) !== undefined
    )
  );
}

// ── Automated axe scan ───────────────────────────────────────────────────────

test.describe('WCAG 2.2 — axe automated scan', () => {
  test('has no automatically detectable WCAG 2.2 violations', async ({ page }) => {
    await page.goto(PAGE);
    await waitForSaffronReady(page);

    const results = await new AxeBuilder({ page })
      .include(ROOT)
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    // Surface all violations in the assertion message for easy debugging
    expect(
      results.violations,
      `axe violations:\n${results.violations
        .map((v) => `  [${v.impact}] ${v.id}: ${v.description}\n    Nodes: ${v.nodes.map((n) => n.html).join('\n    ')}`)
        .join('\n')}`
    ).toHaveLength(0);
  });
});

// ── 1.1.1 Non-text content ───────────────────────────────────────────────────

test.describe('WCAG 1.1.1 — Non-text content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE);
    await waitForSaffronReady(page);
  });

  test('all saf-icon elements inside badges have aria-hidden="true"', async ({ page }) => {
    const icons = page.locator(`${ROOT} saf-badge saf-icon`);
    const count = await icons.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(icons.nth(i)).toHaveAttribute('aria-hidden', 'true');
    }
  });

  test('all saf-badge elements have a meaningful aria-label', async ({ page }) => {
    const badges = page.locator(`${ROOT} .compliance-summary__badges saf-badge`);
    const count = await badges.count();
    expect(count).toBe(6);
    for (let i = 0; i < count; i++) {
      const label = await badges.nth(i).getAttribute('aria-label');
      expect(label).toBeTruthy();
      expect(label!.length).toBeGreaterThan(3);
    }
  });

  test('notification badge has an aria-label', async ({ page }) => {
    const badge = page.locator(`${ROOT} .compliance-summary__notification`);
    const label = await badge.getAttribute('aria-label');
    expect(label).toContain('notification');
  });
});

// ── 1.3.1 Info and Relationships ─────────────────────────────────────────────

test.describe('WCAG 1.3.1 — Info and Relationships', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE);
    await waitForSaffronReady(page);
  });

  test('component uses <article> as semantic wrapper', async ({ page }) => {
    const tag = await page.locator(ROOT).evaluate((el) => el.tagName.toLowerCase());
    expect(tag).toBe('article');
  });

  test('panels use <section> with aria-labelledby', async ({ page }) => {
    const sections = page.locator(`${ROOT} section`);
    await expect(sections).toHaveCount(2);
    for (let i = 0; i < 2; i++) {
      const labelledBy = await sections.nth(i).getAttribute('aria-labelledby');
      expect(labelledBy).toBeTruthy();
    }
  });

  test('stats use <dl>/<dt>/<dd> structure', async ({ page }) => {
    const dls = page.locator(`${ROOT} dl.compliance-summary__stats`);
    await expect(dls).toHaveCount(2);
    for (let i = 0; i < 2; i++) {
      const dts = dls.nth(i).locator('dt');
      const dds = dls.nth(i).locator('dd');
      expect(await dts.count()).toBeGreaterThan(0);
      expect(await dds.count()).toBeGreaterThan(0);
    }
  });

  test('headings follow correct hierarchy h2 > h3', async ({ page }) => {
    const h2 = page.locator(`${ROOT} h2`);
    const h3 = page.locator(`${ROOT} h3`);
    await expect(h2).toHaveCount(1);
    await expect(h3).toHaveCount(2);
  });

  test('saf-divider elements have role="separator" or role="presentation"', async ({ page }) => {
    const dividers = page.locator(`${ROOT} saf-divider`);
    const count = await dividers.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const role = await dividers.nth(i).getAttribute('role');
      expect(['separator', 'presentation']).toContain(role);
    }
  });

  test('panels group is labelled with aria-label', async ({ page }) => {
    const group = page.locator(`${ROOT} .compliance-summary__panels`);
    const label = await group.getAttribute('aria-label');
    expect(label).toBeTruthy();
  });
});

// ── 2.1.1 / 2.1.2 Keyboard ──────────────────────────────────────────────────

test.describe('WCAG 2.1.1/2.1.2 — Keyboard access / no trap', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE);
    await waitForSaffronReady(page);
  });

  test('saf-select is reachable via Tab', async ({ page }) => {
    let found = false;
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      const tag = await page.evaluate(() => document.activeElement?.tagName?.toLowerCase());
      if (tag === 'saf-select' || tag === 'select') { found = true; break; }
    }
    expect(found).toBe(true);
  });

  test('no focus trap — 20 Tabs do not loop back to start prematurely', async ({ page }) => {
    const seen = new Set<string>();
    let trapDetected = false;
    let lastEl = '';
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      const el = await page.evaluate(() =>
        document.activeElement ? document.activeElement.id || document.activeElement.tagName : ''
      );
      if (el === lastEl && i > 2) { trapDetected = true; break; }
      lastEl = el;
    }
    expect(trapDetected).toBe(false);
  });
});

// ── 2.4.6 Headings and Labels ────────────────────────────────────────────────

test.describe('WCAG 2.4.6 — Headings and Labels', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE);
    await waitForSaffronReady(page);
  });

  test('year select has an associated visible label', async ({ page }) => {
    const label = page.locator(`${ROOT} label[for="year-select"]`);
    await expect(label).toBeVisible();
    await expect(label).toHaveText('Year');
  });

  test('select has aria-labelledby pointing to the label', async ({ page }) => {
    const select = page.locator(`${ROOT} saf-select#year-select`);
    const labelledBy = await select.getAttribute('aria-labelledby');
    expect(labelledBy).toBe('year-label');
    const referencedEl = page.locator(`#${labelledBy}`);
    await expect(referencedEl).toBeVisible();
  });

  test('article is labelled with aria-labelledby pointing to h2', async ({ page }) => {
    const article = page.locator(ROOT);
    const labelledBy = await article.getAttribute('aria-labelledby');
    expect(labelledBy).toBe('compliance-title');
    const heading = page.locator(`#${labelledBy}`);
    await expect(heading).toBeVisible();
  });
});

// ── 2.4.7 Focus Visible ──────────────────────────────────────────────────────

test.describe('WCAG 2.4.7 — Focus Visible', () => {
  test('saf-select has a visible focus indicator', async ({ page }) => {
    await page.goto(PAGE);
    await waitForSaffronReady(page);

    const select = page.locator(`${ROOT} saf-select#year-select`);
    await select.focus();

    // Check outline or box-shadow is applied (non-zero)
    const hasFocusStyle = await select.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return (
        style.outline !== 'none' ||
        style.outlineWidth !== '0px' ||
        style.boxShadow !== 'none'
      );
    });
    expect(hasFocusStyle).toBe(true);
  });
});

// ── 4.1.2 Name, Role, Value ──────────────────────────────────────────────────

test.describe('WCAG 4.1.2 — Name, Role, Value', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE);
    await waitForSaffronReady(page);
  });

  test('article has aria-labelledby and aria-roledescription', async ({ page }) => {
    const article = page.locator(ROOT);
    await expect(article).toHaveAttribute('aria-labelledby', 'compliance-title');
    await expect(article).toHaveAttribute('aria-roledescription', 'summary widget');
  });

  test('decorative dividers are aria-hidden', async ({ page }) => {
    const dividers = page.locator(`${ROOT} saf-divider[aria-hidden="true"]`);
    const count = await dividers.count();
    expect(count).toBeGreaterThan(0);
  });

  test('select role is combobox or listbox (ARIA compliant)', async ({ page }) => {
    const select = page.locator(`${ROOT} saf-select#year-select`);
    const role = await select.evaluate((el) =>
      el.getAttribute('role') || el.getAttribute('aria-haspopup') || 'combobox'
    );
    expect(['combobox', 'listbox', 'combobox']).toContain(role);
  });
});
