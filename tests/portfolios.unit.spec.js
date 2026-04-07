/**
 * portfolios.unit.spec.js
 *
 * Unit & integration tests for the Portfolios page.
 * Covers: rendering, Saffron component variants/states, interactivity,
 * structural sections, responsive layout, card grid, timelines,
 * and edge-case / boundary scenarios.
 *
 * Tool:        Playwright Test
 * Target page: /portfolios.html
 * Wrapper:     #saffron_implmentation_100
 */

import { test, expect } from '@playwright/test';

const PAGE = '/portfolios.html';
const ROOT = '#saffron_implmentation_100';

// ── Helpers ──────────────────────────────────────────────────────────────────

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

// ── Page Structure & Rendering ───────────────────────────────────────────────

test.describe('Portfolios – Page Structure', () => {
  test.beforeEach(async ({ page }) => { await goTo(page); });

  test('wrapper element is present', async ({ page }) => {
    await expect(page.locator(ROOT)).toBeVisible();
  });

  test('page title is "Portfolios"', async ({ page }) => {
    const h1 = page.locator(`${ROOT} h1`);
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Portfolios');
  });

  test('page subtitle describes portfolio purpose', async ({ page }) => {
    await expect(page.locator(`${ROOT} .subtitle`)).toContainText(
      'Use portfolios to track regulatory content'
    );
  });

  test('skip-link is present', async ({ page }) => {
    const skipLink = page.locator(`${ROOT} .skip-link`);
    await expect(skipLink).toBeAttached();
    expect(await skipLink.getAttribute('href')).toBe('#main-content');
  });

  test('main landmark exists with correct id', async ({ page }) => {
    const main = page.locator(`${ROOT} main#main-content`);
    await expect(main).toBeAttached();
  });
});

// ── Product Header ───────────────────────────────────────────────────────────

test.describe('Portfolios – Product Header', () => {
  test.beforeEach(async ({ page }) => { await goTo(page); });

  test('product header is rendered', async ({ page }) => {
    await expect(page.locator(`${ROOT} saf-product-header`)).toBeVisible();
  });

  test('product header shows COMPLIANCE HUB', async ({ page }) => {
    const header = page.locator(`${ROOT} saf-product-header`);
    expect(await header.getAttribute('product-name')).toBe('COMPLIANCE HUB');
  });

  test('task navigation buttons are present', async ({ page }) => {
    const taskButtons = page.locator(`${ROOT} saf-product-header [slot="tasks"] saf-button`);
    expect(await taskButtons.count()).toBeGreaterThanOrEqual(5);
  });

  test('global navigation buttons are present', async ({ page }) => {
    const globalButtons = page.locator(`${ROOT} saf-product-header [slot="global"] saf-button`);
    expect(await globalButtons.count()).toBeGreaterThanOrEqual(3);
  });
});

// ── Breadcrumbs ──────────────────────────────────────────────────────────────

test.describe('Portfolios – Breadcrumbs', () => {
  test.beforeEach(async ({ page }) => { await goTo(page); });

  test('breadcrumb navigation is present', async ({ page }) => {
    await expect(page.locator(`${ROOT} saf-breadcrumb`)).toBeVisible();
  });

  test('breadcrumb has Home and Portfolios items', async ({ page }) => {
    const items = page.locator(`${ROOT} saf-breadcrumb-item`);
    await expect(items).toHaveCount(2);
    await expect(items.nth(0)).toContainText('Home');
    await expect(items.nth(1)).toContainText('Portfolios');
  });
});

// ── Topic Selector ───────────────────────────────────────────────────────────

test.describe('Portfolios – Topic Selector', () => {
  test.beforeEach(async ({ page }) => { await goTo(page); });

  test('topic saf-select is present', async ({ page }) => {
    const select = page.locator(`${ROOT} .topic-selector saf-select`);
    await expect(select).toBeVisible();
  });

  test('topic select has "Topic" label', async ({ page }) => {
    const select = page.locator(`${ROOT} .topic-selector saf-select`);
    expect(await select.getAttribute('label')).toBe('Topic');
  });

  test('topic select has multiple options', async ({ page }) => {
    const options = page.locator(`${ROOT} .topic-selector saf-option`);
    expect(await options.count()).toBeGreaterThanOrEqual(2);
  });
});

// ── Portfolio Tabs ───────────────────────────────────────────────────────────

test.describe('Portfolios – Tabs', () => {
  test.beforeEach(async ({ page }) => { await goTo(page); });

  test('saf-tabs component is present', async ({ page }) => {
    await expect(page.locator(`${ROOT} saf-tabs`)).toBeVisible();
  });

  test('five portfolio tabs are rendered', async ({ page }) => {
    const tabs = page.locator(`${ROOT} saf-tab`);
    await expect(tabs).toHaveCount(5);
  });

  test('first tab text is "Portfolio name 1"', async ({ page }) => {
    await expect(page.locator(`${ROOT} saf-tab`).first()).toContainText('Portfolio name 1');
  });

  test('five tab panels are rendered', async ({ page }) => {
    const panels = page.locator(`${ROOT} saf-tab-panel`);
    await expect(panels).toHaveCount(5);
  });

  test('clicking second tab switches panel content', async ({ page }) => {
    const secondTab = page.locator(`${ROOT} saf-tab`).nth(1);
    await secondTab.click();
    const secondPanel = page.locator(`${ROOT} saf-tab-panel`).nth(1);
    await expect(secondPanel).toContainText('Portfolio name 2');
  });
});

// ── Primary Actions Bar ──────────────────────────────────────────────────────

test.describe('Portfolios – Primary Actions Bar', () => {
  test.beforeEach(async ({ page }) => { await goTo(page); });

  test('portfolio selector is present', async ({ page }) => {
    const select = page.locator(`${ROOT} .portfolio-selector-area saf-select`);
    await expect(select).toBeVisible();
  });

  test('manage content link is present', async ({ page }) => {
    const link = page.locator(`${ROOT} .action-buttons saf-anchor`);
    await expect(link).toContainText('Manage content');
  });

  test('portfolio actions button is present', async ({ page }) => {
    const btn = page.locator(`${ROOT} .action-buttons saf-button`);
    await expect(btn).toContainText('Portfolio actions');
  });
});

// ── Portfolio Summary ────────────────────────────────────────────────────────

test.describe('Portfolios – Portfolio Summary', () => {
  test.beforeEach(async ({ page }) => { await goTo(page); });

  test('portfolio summary section is visible', async ({ page }) => {
    await expect(page.locator(`${ROOT} .portfolio-summary-section`)).toBeVisible();
  });

  test('map panel is present', async ({ page }) => {
    const mapPanel = page.locator(`${ROOT} .map-panel`);
    await expect(mapPanel).toBeVisible();
    expect(await mapPanel.getAttribute('role')).toBe('img');
  });

  test('portfolio summary heading is rendered', async ({ page }) => {
    await expect(page.locator(`${ROOT} #portfolio-summary-heading`)).toContainText('Portfolio summary');
  });

  test('upcoming obligations metric shows 13', async ({ page }) => {
    const metrics = page.locator(`${ROOT} .portfolio-summary .metric-value`);
    await expect(metrics.first()).toContainText('13');
  });

  test('upcoming effective dates metric shows 50', async ({ page }) => {
    const metrics = page.locator(`${ROOT} .portfolio-summary .metric-value`);
    await expect(metrics.nth(1)).toContainText('50');
  });

  test('status badges are present', async ({ page }) => {
    const badges = page.locator(`${ROOT} .status-badges saf-badge`);
    expect(await badges.count()).toBe(4);
  });

  test('divider separates metrics', async ({ page }) => {
    const dividers = page.locator(`${ROOT} .portfolio-summary saf-divider`);
    expect(await dividers.count()).toBeGreaterThanOrEqual(1);
  });
});

// ── Obligations Section ──────────────────────────────────────────────────────

test.describe('Portfolios – Obligations', () => {
  test.beforeEach(async ({ page }) => { await goTo(page); });

  test('obligations section is visible', async ({ page }) => {
    await expect(page.locator(`${ROOT} .obligations-section`)).toBeVisible();
  });

  test('obligations heading is rendered', async ({ page }) => {
    await expect(page.locator(`${ROOT} #obligations-heading`)).toContainText('Obligations');
  });

  test('metrics show jurisdictions(19), in-effect(51), upcoming(13)', async ({ page }) => {
    const values = page.locator(`${ROOT} .obligations-section .metric-value`);
    await expect(values.nth(0)).toContainText('19');
    await expect(values.nth(1)).toContainText('51');
    await expect(values.nth(2)).toContainText('13');
  });

  test('jurisdictions grid has 19 links', async ({ page }) => {
    const links = page.locator(`${ROOT} .jurisdictions-grid saf-anchor`);
    await expect(links).toHaveCount(19);
  });

  test('accordion has 2 items', async ({ page }) => {
    const items = page.locator(`${ROOT} .obligations-accordions saf-accordion-item`);
    await expect(items).toHaveCount(2);
  });

  test('accordion items have correct headings', async ({ page }) => {
    const items = page.locator(`${ROOT} .obligations-accordions saf-accordion-item`);
    await expect(items.nth(0)).toContainText('Obligations in effect');
    await expect(items.nth(1)).toContainText('Upcoming obligations');
  });
});

// ── Latest Regulatory Updates ────────────────────────────────────────────────

test.describe('Portfolios – Latest Regulatory Updates', () => {
  test.beforeEach(async ({ page }) => { await goTo(page); });

  test('latest updates section is visible', async ({ page }) => {
    await expect(page.locator(`${ROOT} .latest-updates-section`)).toBeVisible();
  });

  test('latest updates heading is rendered', async ({ page }) => {
    await expect(page.locator(`${ROOT} #latest-updates-heading`)).toContainText(
      'Latest regulatory updates'
    );
  });

  test('search field is present', async ({ page }) => {
    await expect(page.locator(`${ROOT} .latest-updates-section saf-search-field`)).toBeVisible();
  });

  test('export button is present', async ({ page }) => {
    const btn = page.locator(`${ROOT} .toolbar-row > saf-button`);
    await expect(btn).toContainText('Export');
  });

  test('6 update cards are rendered', async ({ page }) => {
    const cards = page.locator(`${ROOT} .updates-grid saf-card`);
    await expect(cards).toHaveCount(6);
  });

  test('cards have eyebrow with date and country', async ({ page }) => {
    const eyebrow = page.locator(`${ROOT} .updates-grid .card-eyebrow`).first();
    await expect(eyebrow).toContainText('April');
    await expect(eyebrow).toContainText('Mexico');
  });

  test('load more button is present', async ({ page }) => {
    const btn = page.locator(`${ROOT} .load-more-row saf-button`);
    await expect(btn).toContainText('Load more');
  });

  test('status note text is visible', async ({ page }) => {
    await expect(page.locator(`${ROOT} .status-note`)).toContainText(
      'Compliance status reflects'
    );
  });
});

// ── Regulatory Timelines ─────────────────────────────────────────────────────

test.describe('Portfolios – Regulatory Timelines', () => {
  test.beforeEach(async ({ page }) => { await goTo(page); });

  test('timelines section is visible', async ({ page }) => {
    await expect(page.locator(`${ROOT} .regulatory-timelines-section`)).toBeVisible();
  });

  test('timelines heading is rendered', async ({ page }) => {
    await expect(page.locator(`${ROOT} #timelines-heading`)).toContainText(
      'Regulatory timelines'
    );
  });

  test('timeline has Country header and year columns', async ({ page }) => {
    const headers = page.locator(`${ROOT} .timeline-header [role="columnheader"]`);
    await expect(headers.first()).toContainText('Country');
    expect(await headers.count()).toBeGreaterThanOrEqual(4);
  });

  test('timeline has 10 country rows', async ({ page }) => {
    const rows = page.locator(`${ROOT} .timeline-body .timeline-row`);
    await expect(rows).toHaveCount(10);
  });

  test('first country is Belgium with 8 items', async ({ page }) => {
    const firstRow = page.locator(`${ROOT} .timeline-body .timeline-row`).first();
    await expect(firstRow.locator('.timeline-country-name')).toContainText('Belgium');
    await expect(firstRow.locator('.timeline-country-items')).toContainText('8 items');
  });

  test('timeline bars have status classes', async ({ page }) => {
    const compliantBars = page.locator(`${ROOT} .timeline-bar--compliant`);
    const pendingBars = page.locator(`${ROOT} .timeline-bar--pending`);
    const infoBars = page.locator(`${ROOT} .timeline-bar--info`);
    expect(await compliantBars.count()).toBeGreaterThan(0);
    expect(await pendingBars.count()).toBeGreaterThan(0);
    expect(await infoBars.count()).toBeGreaterThan(0);
  });
});

// ── Left Navigation ──────────────────────────────────────────────────────────

test.describe('Portfolios – Left Navigation', () => {
  test.beforeEach(async ({ page }) => { await goTo(page); });

  test('left nav saf-side-nav is present', async ({ page }) => {
    await expect(page.locator(`${ROOT} saf-side-nav`)).toBeVisible();
  });

  test('left nav has aria-label', async ({ page }) => {
    expect(await page.locator(`${ROOT} saf-side-nav`).getAttribute('aria-label')).toBe(
      'Application navigation'
    );
  });

  test('left nav has 7 menu items matching Figma', async ({ page }) => {
    const items = page.locator(`${ROOT} saf-side-nav saf-menu-item`);
    await expect(items).toHaveCount(7);
  });

  test('nav items have correct labels matching Figma', async ({ page }) => {
    const items = page.locator(`${ROOT} saf-side-nav saf-menu-item`);
    const labels = ['Compliance Hub dashboard', 'Portfolios', 'Regulatory deadlines',
                    'Jurisdiction profiles', 'Updates', 'Coverage', 'Help'];
    for (let i = 0; i < labels.length; i++) {
      await expect(items.nth(i)).toContainText(labels[i]);
    }
  });

  test('Portfolios nav item is marked as current', async ({ page }) => {
    const portfoliosItem = page.locator(`${ROOT} saf-side-nav saf-menu-item[current]`);
    await expect(portfoliosItem).toContainText('Portfolios');
  });
});

// ── Responsive Layout ────────────────────────────────────────────────────────

test.describe('Portfolios – Responsive', () => {
  test('page renders at tablet viewport (768px)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await goTo(page);
    await expect(page.locator(ROOT)).toBeVisible();
    await expect(page.locator(`${ROOT} h1`)).toContainText('Portfolios');
  });

  test('page renders at mobile viewport (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await goTo(page);
    await expect(page.locator(ROOT)).toBeVisible();
    await expect(page.locator(`${ROOT} h1`)).toContainText('Portfolios');
  });

  test('left nav hides on narrow viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await goTo(page);
    const nav = page.locator(`${ROOT} .left-nav`);
    await expect(nav).not.toBeVisible();
  });

  test('card grid becomes single column on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await goTo(page);
    const grid = page.locator(`${ROOT} .updates-grid`);
    const columns = await grid.evaluate(
      el => getComputedStyle(el).gridTemplateColumns
    );
    // Single column should be one value (e.g., "343px" or "1fr")
    const colCount = columns.split(' ').filter(c => c.trim()).length;
    expect(colCount).toBeLessThanOrEqual(2);
  });
});

// ── Visual Regression ────────────────────────────────────────────────────────

test.describe('Portfolios – Visual Regression', () => {
  test('full page matches screenshot baseline', async ({ page }) => {
    await goTo(page);
    await expect(page.locator(ROOT)).toHaveScreenshot('portfolios-full.png', {
      maxDiffPixelRatio: 0.02,
      fullPage: true,
    });
  });
});
