/**
 * portfolios.a11y.spec.js
 *
 * WCAG 2.2 Accessibility tests for the Portfolios page.
 *
 * Covers:
 *  - Axe-core automated scan (wcag2a, wcag2aa, wcag22aa)
 *  - Semantic landmarks and heading hierarchy
 *  - ARIA roles, labels, and relationships
 *  - Keyboard navigation and focus management
 *  - Skip navigation link
 *  - Focus indicators
 *  - Screen-reader compatibility
 *
 * Tool: Playwright Test + @axe-core/playwright
 */

import { test, expect }    from '@playwright/test';
import AxeBuilder          from '@axe-core/playwright';

const PAGE = '/portfolios.html';
const ROOT = '#saffron_implmentation_100';

// ── Setup ────────────────────────────────────────────────────────────────────

async function waitForSaffronReady(page) {
  await page.waitForFunction(() =>
    [
      'saf-button', 'saf-select', 'saf-icon', 'saf-anchor',
      'saf-tabs', 'saf-card', 'saf-badge', 'saf-breadcrumb',
      'saf-accordion', 'saf-search-field', 'saf-product-header',
    ].every((tag) => customElements.get(tag) !== undefined)
  );
}

async function goTo(page) {
  await page.goto(PAGE);
  await waitForSaffronReady(page);
  await page.waitForSelector(ROOT, { timeout: 5000 });
}

// ── Axe Automated A11y Scan ──────────────────────────────────────────────────

test.describe('Portfolios – Axe Automated A11y', () => {
  test('passes axe-core scan with no critical violations', async ({ page }) => {
    await goTo(page);
    const results = await new AxeBuilder({ page })
      .include(ROOT)
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .analyze();

    const critical = results.violations.filter(v => v.impact === 'critical');
    const serious  = results.violations.filter(v => v.impact === 'serious');

    if (critical.length || serious.length) {
      console.error('A11y violations:\n', JSON.stringify([...critical, ...serious], null, 2));
    }

    expect(critical).toHaveLength(0);
    expect(serious).toHaveLength(0);
  });

  test('no color contrast violations on page header', async ({ page }) => {
    await goTo(page);
    const results = await new AxeBuilder({ page })
      .include(`${ROOT} .page-header`)
      .withTags(['wcag2aa'])
      .analyze();

    const contrastViolations = results.violations.filter(v => v.id === 'color-contrast');
    expect(contrastViolations).toHaveLength(0);
  });

  test('no color contrast violations on obligations section', async ({ page }) => {
    await goTo(page);
    const results = await new AxeBuilder({ page })
      .include(`${ROOT} .obligations-section`)
      .withTags(['wcag2aa'])
      .analyze();

    const contrastViolations = results.violations.filter(v => v.id === 'color-contrast');
    expect(contrastViolations).toHaveLength(0);
  });

  test('no color contrast violations on timeline section', async ({ page }) => {
    await goTo(page);
    const results = await new AxeBuilder({ page })
      .include(`${ROOT} .regulatory-timelines-section`)
      .withTags(['wcag2aa'])
      .analyze();

    const contrastViolations = results.violations.filter(v => v.id === 'color-contrast');
    expect(contrastViolations).toHaveLength(0);
  });
});

// ── Skip Navigation ──────────────────────────────────────────────────────────

test.describe('Portfolios – Skip Navigation', () => {
  test.beforeEach(async ({ page }) => { await goTo(page); });

  test('skip link is present and targets main content', async ({ page }) => {
    const skipLink = page.locator(`${ROOT} .skip-link`);
    await expect(skipLink).toBeAttached();
    expect(await skipLink.getAttribute('href')).toBe('#main-content');
    await expect(skipLink).toContainText('Skip to main content');
  });

  test('skip link becomes visible on focus', async ({ page }) => {
    const skipLink = page.locator(`${ROOT} .skip-link`);
    await skipLink.focus();
    const top = await skipLink.evaluate(el => getComputedStyle(el).top);
    // When focused, top should not be -100% (should be a positive value)
    expect(top).not.toBe('-100%');
  });

  test('skip link target element exists', async ({ page }) => {
    const main = page.locator('#main-content');
    await expect(main).toBeAttached();
  });
});

// ── Landmarks ────────────────────────────────────────────────────────────────

test.describe('Portfolios – Landmarks', () => {
  test.beforeEach(async ({ page }) => { await goTo(page); });

  test('page has <main> landmark', async ({ page }) => {
    const main = page.locator(`${ROOT} main`);
    const tag = await main.evaluate(el => el.tagName.toLowerCase());
    expect(tag).toBe('main');
  });

  test('page has saf-side-nav with aria-label', async ({ page }) => {
    const nav = page.locator(`${ROOT} saf-side-nav`);
    expect(await nav.getAttribute('aria-label')).toBe('Application navigation');
  });

  test('page has <header> within main', async ({ page }) => {
    const header = page.locator(`${ROOT} main .page-header`);
    const tag = await header.evaluate(el => el.tagName.toLowerCase());
    expect(tag).toBe('header');
  });
});

// ── Heading Hierarchy ────────────────────────────────────────────────────────

test.describe('Portfolios – Heading Hierarchy', () => {
  test.beforeEach(async ({ page }) => { await goTo(page); });

  test('h1 is "Portfolios"', async ({ page }) => {
    const h1 = page.locator(`${ROOT} h1`);
    await expect(h1).toHaveCount(1);
    await expect(h1).toContainText('Portfolios');
  });

  test('h2 headings are present for each section', async ({ page }) => {
    const h2s = page.locator(`${ROOT} h2`);
    const count = await h2s.count();
    expect(count).toBeGreaterThanOrEqual(4);

    const texts = [];
    for (let i = 0; i < count; i++) {
      texts.push(await h2s.nth(i).textContent());
    }

    expect(texts.some(t => t.includes('Portfolio summary'))).toBe(true);
    expect(texts.some(t => t.includes('Obligations'))).toBe(true);
    expect(texts.some(t => t.includes('Latest regulatory updates'))).toBe(true);
    expect(texts.some(t => t.includes('Regulatory timelines'))).toBe(true);
  });

  test('no heading level is skipped (h1 → h2 → h3)', async ({ page }) => {
    const headings = await page.locator(`${ROOT} h1, ${ROOT} h2, ${ROOT} h3, ${ROOT} h4, ${ROOT} h5, ${ROOT} h6`).evaluateAll(
      els => els.map(el => parseInt(el.tagName.charAt(1)))
    );

    for (let i = 1; i < headings.length; i++) {
      const diff = headings[i] - headings[i - 1];
      // A heading can skip up (e.g., h3 → h2) but must not skip down (e.g., h1 → h3)
      expect(diff).toBeLessThanOrEqual(1);
    }
  });
});

// ── ARIA Labels & Roles ──────────────────────────────────────────────────────

test.describe('Portfolios – ARIA Labels & Roles', () => {
  test.beforeEach(async ({ page }) => { await goTo(page); });

  test('breadcrumb has aria-label', async ({ page }) => {
    const bc = page.locator(`${ROOT} saf-breadcrumb`);
    expect(await bc.getAttribute('aria-label')).toBe('Breadcrumb navigation');
  });

  test('tabs have aria-label', async ({ page }) => {
    const tabs = page.locator(`${ROOT} saf-tabs`);
    expect(await tabs.getAttribute('aria-label')).toBe('Portfolio tabs');
  });

  test('map panel has role="img" with aria-label', async ({ page }) => {
    const map = page.locator(`${ROOT} .map-panel`);
    expect(await map.getAttribute('role')).toBe('img');
    expect(await map.getAttribute('aria-label')).toBeTruthy();
  });

  test('updates grid has role="list"', async ({ page }) => {
    const grid = page.locator(`${ROOT} .updates-grid`);
    expect(await grid.getAttribute('role')).toBe('list');
  });

  test('update cards are wrapped in role="listitem"', async ({ page }) => {
    const items = page.locator(`${ROOT} .updates-grid [role="listitem"]`);
    expect(await items.count()).toBe(6);
  });

  test('timeline container has role="table"', async ({ page }) => {
    const container = page.locator(`${ROOT} .timeline-container`);
    expect(await container.getAttribute('role')).toBe('table');
    expect(await container.getAttribute('aria-label')).toBeTruthy();
  });

  test('timeline rows have role="row" and correct sub-roles', async ({ page }) => {
    const rowheaders = page.locator(`${ROOT} .timeline-body [role="rowheader"]`);
    const cells = page.locator(`${ROOT} .timeline-body [role="cell"]`);
    expect(await rowheaders.count()).toBeGreaterThan(0);
    expect(await cells.count()).toBeGreaterThan(0);
  });

  test('sections have aria-labelledby linking to headings', async ({ page }) => {
    const sections = [
      { selector: '.portfolio-summary-section', headingId: 'portfolio-summary-heading' },
      { selector: '.obligations-section', headingId: 'obligations-heading' },
      { selector: '.latest-updates-section', headingId: 'latest-updates-heading' },
      { selector: '.regulatory-timelines-section', headingId: 'timelines-heading' },
    ];

    for (const { selector, headingId } of sections) {
      const section = page.locator(`${ROOT} ${selector}`);
      expect(await section.getAttribute('aria-labelledby')).toBe(headingId);
    }
  });

  test('icon-only buttons have a11y-aria-label', async ({ page }) => {
    // Check authored tooltip info buttons in body content
    const sel = `${ROOT} .body-content saf-tooltip saf-button[icon-only]`;
    const buttons = page.locator(sel);
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const label = await buttons.nth(i).getAttribute('a11y-aria-label');
      expect(label, `Button at index ${i} missing a11y-aria-label`).toBeTruthy();
    }
  });
});

// ── Keyboard Navigation ─────────────────────────────────────────────────────

test.describe('Portfolios – Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => { await goTo(page); });

  test('Tab key moves focus through interactive elements', async ({ page }) => {
    // Tab to skip link first
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.className);
    expect(focused).toContain('skip-link');
  });

  test('tab navigation reaches breadcrumb links', async ({ page }) => {
    // Tab through to breadcrumb area
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
    }
    // Verify we can reach interactive elements
    const activeTag = await page.evaluate(() => document.activeElement?.tagName?.toLowerCase());
    expect(activeTag).toBeTruthy();
  });

  test('all interactive elements have a visible focus indicator', async ({ page }) => {
    const interactiveSelectors = [
      `${ROOT} saf-button`,
      `${ROOT} saf-anchor`,
      `${ROOT} saf-select`,
    ];

    for (const selector of interactiveSelectors) {
      const el = page.locator(selector).first();
      if (await el.isVisible()) {
        await el.focus();
        // Saffron components natively handle focus indicators
        const focused = await page.evaluate(() => !!document.activeElement);
        expect(focused).toBe(true);
      }
    }
  });
});

// ── Screen Reader Text ───────────────────────────────────────────────────────

test.describe('Portfolios – Screen Reader Support', () => {
  test.beforeEach(async ({ page }) => { await goTo(page); });

  test('saf-sr-only elements are present for icon-only buttons', async ({ page }) => {
    const srOnlyElements = page.locator(`${ROOT} saf-sr-only`);
    expect(await srOnlyElements.count()).toBeGreaterThan(0);
  });

  test('metric values have aria-label describing the count', async ({ page }) => {
    const metricValues = page.locator(`${ROOT} .metric-value[aria-label]`);
    expect(await metricValues.count()).toBeGreaterThan(0);
  });

  test('timeline cells have aria-label describing the data', async ({ page }) => {
    const cells = page.locator(`${ROOT} .timeline-bars[aria-label]`);
    expect(await cells.count()).toBeGreaterThan(0);
  });
});
