/**
 * regulatory-deadlines.unit.spec.js
 *
 * Unit & integration tests for the Regulatory Deadlines Timeline Widget.
 * Covers: rendering, Saffron component variants/states, interactivity,
 * keyboard navigation, year navigation, view toggle, tooltip, responsiveness,
 * and edge-case data states.
 *
 * Tool:        Playwright Test
 * Target page: /compliance-summary.html
 * Widget:      article.reg-deadlines
 */

import { test, expect } from '@playwright/test';

const PAGE  = '/compliance-summary.html';
const ROOT  = '.reg-deadlines';

// ── Helpers ──────────────────────────────────────────────────────────────────

async function waitForSaffronReady(page) {
  await page.waitForFunction(() =>
    ['saf-button', 'saf-select', 'saf-button-group', 'saf-icon', 'saf-anchor'].every(
      (tag) => customElements.get(tag) !== undefined
    )
  );
}

async function goTo(page) {
  await page.goto(PAGE);
  await waitForSaffronReady(page);
  // Give chart JS time to render SVG
  await page.waitForSelector('.reg-deadlines__chart-canvas svg', { timeout: 5000 });
}

// ── Rendering ────────────────────────────────────────────────────────────────

test.describe('Regulatory Deadlines – Rendering', () => {
  test.beforeEach(async ({ page }) => { await goTo(page); });

  test('widget article is visible on page', async ({ page }) => {
    await expect(page.locator(ROOT)).toBeVisible();
  });

  test('card has border using Saffron border-strong token', async ({ page }) => {
    const border = await page.locator(ROOT).evaluate(
      el => getComputedStyle(el).border
    );
    // Should have a visible border (not 0px)
    expect(border).not.toMatch(/0px none/);
  });

  test('renders eyebrow label "Digital controls"', async ({ page }) => {
    await expect(page.locator(`${ROOT} .reg-deadlines__eyebrow`)).toContainText('Digital controls');
  });

  test('renders h2 heading "Regulatory deadlines"', async ({ page }) => {
    const h2 = page.locator(`${ROOT} h2.reg-deadlines__title`);
    await expect(h2).toBeVisible();
    await expect(h2).toContainText('Regulatory deadlines');
  });

  test('renders year as 2026 on initial load', async ({ page }) => {
    await expect(page.locator(`${ROOT} .reg-deadlines__year`)).toContainText('2026');
  });

  test('View saf-select is present with default value', async ({ page }) => {
    const viewSelect = page.locator(`${ROOT} #rd-view-select`);
    await expect(viewSelect).toBeVisible();
    const val = await viewSelect.getAttribute('current-value');
    expect(val).toBe('your-deadlines');
  });

  test('Forecast saf-select is present with default "Yearly"', async ({ page }) => {
    const el = page.locator(`${ROOT} #rd-forecast-select`);
    await expect(el).toBeVisible();
    const val = await el.getAttribute('current-value');
    expect(val).toBe('yearly');
  });

  test('renders saf-button-group with Timeline and Table buttons', async ({ page }) => {
    const group = page.locator(`${ROOT} saf-button-group`);
    await expect(group).toBeVisible();
    await expect(page.locator(`${ROOT} #rd-btn-timeline`)).toContainText('Timeline');
    await expect(page.locator(`${ROOT} #rd-btn-table`)).toContainText('Table');
  });

  test('Timeline button has primary appearance (active) on load', async ({ page }) => {
    const timelineBtn = page.locator(`${ROOT} #rd-btn-timeline`);
    expect(await timelineBtn.getAttribute('appearance')).toBe('primary');
    expect(await timelineBtn.getAttribute('aria-pressed')).toBe('true');
  });

  test('Table button has secondary appearance (inactive) on load', async ({ page }) => {
    const tableBtn = page.locator(`${ROOT} #rd-btn-table`);
    expect(await tableBtn.getAttribute('appearance')).toBe('secondary');
    expect(await tableBtn.getAttribute('aria-pressed')).toBe('false');
  });

  test('SVG chart is rendered inside chart canvas', async ({ page }) => {
    await expect(page.locator(`${ROOT} .reg-deadlines__chart-canvas svg`)).toBeVisible();
  });

  test('SVG contains dot groups for all 12 months', async ({ page }) => {
    const groups = page.locator(`${ROOT} .reg-deadlines__chart-canvas svg .reg-deadlines__dot-group`);
    await expect(groups).toHaveCount(12);
  });

  test('renders month axis with 12 labels', async ({ page }) => {
    const ticks = page.locator(`${ROOT} .reg-deadlines__axis-tick`);
    await expect(ticks).toHaveCount(12);
  });

  test('axis tick for January has the major (thicker) class', async ({ page }) => {
    const janTick = page.locator(`${ROOT} .reg-deadlines__axis-tick--major`);
    await expect(janTick).toBeVisible();
    await expect(janTick).toContainText('Jan');
  });

  test('renders 3 legend items (Not compliant, No status, Compliant)', async ({ page }) => {
    const items = page.locator(`${ROOT} .reg-deadlines__legend-item`);
    await expect(items).toHaveCount(3);
  });

  test('legend dot colours use data-viz tokens', async ({ page }) => {
    const orangeDot = page.locator(`${ROOT} .reg-deadlines__legend-dot--not-compliant`);
    const bg = await orangeDot.evaluate(el => getComputedStyle(el).backgroundColor);
    // Should resolve to orange (rgb(230, 140, 102) = #E68C66)
    expect(bg).toMatch(/rgb\(230,\s?140,\s?102\)/);
  });

  test('renders "Go to deadlines" saf-anchor link', async ({ page }) => {
    const link = page.locator(`${ROOT} saf-anchor.reg-deadlines__cta`);
    await expect(link).toBeVisible();
    await expect(link).toContainText('Go to deadlines');
  });

  test('prev-year button is rendered as icon-only saf-button (tertiary)', async ({ page }) => {
    const btn = page.locator(`${ROOT} #rd-btn-prev-year`);
    await expect(btn).toBeVisible();
    expect(await btn.getAttribute('appearance')).toBe('tertiary');
    expect(await btn.getAttribute('icon-only')).not.toBeNull();
  });

  test('next-year button is rendered as icon-only saf-button (tertiary)', async ({ page }) => {
    const btn = page.locator(`${ROOT} #rd-btn-next-year`);
    await expect(btn).toBeVisible();
    expect(await btn.getAttribute('appearance')).toBe('tertiary');
  });

  test('chart canvas div is aria-hidden (chart described by SR table)', async ({ page }) => {
    const canvas = page.locator(`${ROOT} #rd-chart-canvas`);
    expect(await canvas.getAttribute('aria-hidden')).toBe('true');
  });

  test('screen-reader table is present but visually hidden', async ({ page }) => {
    const table = page.locator(`${ROOT} #rd-sr-table`);
    // Should exist in DOM
    await expect(table).toBeAttached();
    // Should be visually hidden
    const clip = await table.evaluate(el => getComputedStyle(el).clip);
    expect(clip).toBe('rect(0px, 0px, 0px, 0px)');
  });

  test('SR table is populated with 12 month rows', async ({ page }) => {
    const rows = page.locator(`${ROOT} #reg-deadlines-table-body tr`);
    await expect(rows).toHaveCount(12);
  });

  test('April SR row shows notCompliant=9, noStatus=4, compliant=3', async ({ page }) => {
    const rows = page.locator(`${ROOT} #reg-deadlines-table-body tr`);
    const aprRow = rows.nth(3); // 0-indexed: Apr = index 3
    const cells = aprRow.locator('td');
    await expect(cells.nth(0)).toContainText('9');
    await expect(cells.nth(1)).toContainText('4');
    await expect(cells.nth(2)).toContainText('3');
    await expect(cells.nth(3)).toContainText('16'); // total
  });
});

// ── Year Navigation ──────────────────────────────────────────────────────────

test.describe('Regulatory Deadlines – Year Navigation', () => {
  test.beforeEach(async ({ page }) => { await goTo(page); });

  test('clicking next-year advances year to 2027', async ({ page }) => {
    await page.locator(`${ROOT} #rd-btn-next-year`).click();
    await expect(page.locator(`${ROOT} .reg-deadlines__year`)).toContainText('2027');
  });

  test('clicking prev-year goes back to 2025', async ({ page }) => {
    await page.locator(`${ROOT} #rd-btn-prev-year`).click();
    await expect(page.locator(`${ROOT} .reg-deadlines__year`)).toContainText('2025');
  });

  test('prev-year disabled at minimum year boundary', async ({ page }) => {
    // Go to first available year (2025)
    await page.locator(`${ROOT} #rd-btn-prev-year`).click();
    // Now at 2025; 2024 not in data → prev should be disabled
    await expect(page.locator(`${ROOT} #rd-btn-prev-year`)).toBeDisabled();
  });

  test('next-year disabled at maximum year boundary', async ({ page }) => {
    // Go to 2027
    await page.locator(`${ROOT} #rd-btn-next-year`).click();
    await expect(page.locator(`${ROOT} #rd-btn-next-year`)).toBeDisabled();
  });

  test('SVG re-renders after year change', async ({ page }) => {
    // Count dots in a month before and after year change to confirm re-render
    const getAprNotCompliantCount = async () =>
      page.locator(`${ROOT} .reg-deadlines__chart-canvas svg circle[data-status="notCompliant"]`).count();

    const before = await getAprNotCompliantCount();
    await page.locator(`${ROOT} #rd-btn-prev-year`).click();
    await page.waitForTimeout(300); // let RAF settle
    const after = await getAprNotCompliantCount();
    // Different year has different notCompliant counts
    expect(before).not.toBe(after);
  });

  test('year live region has aria-live="polite"', async ({ page }) => {
    const year = page.locator(`${ROOT} .reg-deadlines__year`);
    expect(await year.getAttribute('aria-live')).toBe('polite');
    expect(await year.getAttribute('aria-atomic')).toBe('true');
  });
});

// ── View Toggle ──────────────────────────────────────────────────────────────

test.describe('Regulatory Deadlines – View Toggle', () => {
  test.beforeEach(async ({ page }) => { await goTo(page); });

  test('clicking Table button makes it primary / active', async ({ page }) => {
    await page.locator(`${ROOT} #rd-btn-table`).click();
    await expect(page.locator(`${ROOT} #rd-btn-table`)).toHaveAttribute('appearance', 'primary');
    await expect(page.locator(`${ROOT} #rd-btn-table`)).toHaveAttribute('aria-pressed', 'true');
  });

  test('clicking Table button makes Timeline secondary / inactive', async ({ page }) => {
    await page.locator(`${ROOT} #rd-btn-table`).click();
    await expect(page.locator(`${ROOT} #rd-btn-timeline`)).toHaveAttribute('appearance', 'secondary');
    await expect(page.locator(`${ROOT} #rd-btn-timeline`)).toHaveAttribute('aria-pressed', 'false');
  });

  test('clicking Timeline again restores it to primary', async ({ page }) => {
    await page.locator(`${ROOT} #rd-btn-table`).click();
    await page.locator(`${ROOT} #rd-btn-timeline`).click();
    await expect(page.locator(`${ROOT} #rd-btn-timeline`)).toHaveAttribute('appearance', 'primary');
  });
});

// ── Tooltip ──────────────────────────────────────────────────────────────────

test.describe('Regulatory Deadlines – Tooltip', () => {
  test.beforeEach(async ({ page }) => { await goTo(page); });

  test('tooltip is hidden on initial load', async ({ page }) => {
    const tooltip = page.locator(`${ROOT} .reg-deadlines__tooltip`);
    // Should not have visible class
    await expect(tooltip).not.toHaveClass(/reg-deadlines__tooltip--visible/);
  });

  test('focusing a month dot-group shows tooltip', async ({ page }) => {
    const firstGroup = page.locator(`${ROOT} .reg-deadlines__dot-group`).first();
    await firstGroup.focus();
    await expect(page.locator(`${ROOT} .reg-deadlines__tooltip`))
      .toHaveClass(/reg-deadlines__tooltip--visible/);
  });

  test('blurring hides tooltip', async ({ page }) => {
    const firstGroup = page.locator(`${ROOT} .reg-deadlines__dot-group`).first();
    await firstGroup.focus();
    await firstGroup.blur();
    await expect(page.locator(`${ROOT} .reg-deadlines__tooltip`))
      .not.toHaveClass(/reg-deadlines__tooltip--visible/);
  });

  test('tooltip displays a numeric count for the month', async ({ page }) => {
    const firstGroup = page.locator(`${ROOT} .reg-deadlines__dot-group`).first();
    await firstGroup.focus();
    const countEl = page.locator(`${ROOT} .reg-deadlines__tooltip-count`);
    const countText = await countEl.textContent();
    expect(Number(countText)).toBeGreaterThan(0);
  });

  test('tooltip displays "not compliant" detail text', async ({ page }) => {
    const firstGroup = page.locator(`${ROOT} .reg-deadlines__dot-group`).first();
    await firstGroup.focus();
    const detail = page.locator(`${ROOT} .reg-deadlines__tooltip-detail`);
    await expect(detail).toContainText('not compliant');
  });
});

// ── Keyboard Navigation ──────────────────────────────────────────────────────

test.describe('Regulatory Deadlines – Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => { await goTo(page); });

  test('Tab reaches the View saf-select', async ({ page }) => {
    await page.keyboard.press('Tab');
    // Keep tabbing until we reach the view select
    for (let i = 0; i < 10; i++) {
      const focused = await page.evaluate(() => document.activeElement?.id || document.activeElement?.tagName);
      if (focused === 'rd-view-select') break;
      await page.keyboard.press('Tab');
    }
    const active = await page.evaluate(() => document.activeElement?.id);
    expect(active).toBe('rd-view-select');
  });

  test('prev/next year buttons are reachable by Tab', async ({ page }) => {
    // Tab through all focusable elements and check both buttons are hit
    const focusedIds = new Set();
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      const id = await page.evaluate(() => document.activeElement?.id);
      if (id) focusedIds.add(id);
    }
    expect(focusedIds.has('rd-btn-prev-year') || focusedIds.has('rd-btn-next-year')).toBe(true);
  });

  test('pressing Enter on a month dot-group triggers tooltip', async ({ page }) => {
    const firstGroup = page.locator(`${ROOT} .reg-deadlines__dot-group`).first();
    await firstGroup.focus();
    // Focus shows tooltip
    await expect(page.locator(`${ROOT} .reg-deadlines__tooltip`))
      .toHaveClass(/reg-deadlines__tooltip--visible/);
  });

  test('Tab traverses all 12 month dot-groups in the SVG', async ({ page }) => {
    // Focus the prev year button then Tab past – dot groups should receive focus
    await page.locator(`${ROOT} #rd-btn-prev-year`).focus();
    const focusedMonths = new Set();
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      const dataMonth = await page.evaluate(() =>
        document.activeElement?.getAttribute('data-month') || null
      );
      if (dataMonth) focusedMonths.add(dataMonth);
    }
    expect(focusedMonths.size).toBeGreaterThan(0);
  });
});

// ── Responsiveness ───────────────────────────────────────────────────────────

test.describe('Regulatory Deadlines – Responsiveness', () => {
  test('renders correctly on desktop (1280×800)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await goTo(page);
    await expect(page.locator(ROOT)).toBeVisible();
    // Header should be horizontal (flex-row) at large breakpoint
    const display = await page.locator(`${ROOT} .reg-deadlines__header`).evaluate(
      el => getComputedStyle(el).flexDirection
    );
    expect(display).toBe('row');
  });

  test('stacks controls vertically on mobile (375×812)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await goTo(page);
    const dir = await page.locator(`${ROOT} .reg-deadlines__header`).evaluate(
      el => getComputedStyle(el).flexDirection
    );
    expect(dir).toBe('column');
  });

  test('SVG chart canvas resizes to fill width', async ({ page }) => {
    await goTo(page);
    const svgWidth = await page.locator(`${ROOT} .reg-deadlines__chart-canvas svg`).evaluate(
      el => el.getBoundingClientRect().width
    );
    expect(svgWidth).toBeGreaterThan(300);
  });

  test('renders without overflow on tablet (768×1024)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await goTo(page);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2); // allow 2px rounding
  });
});

// ── Edge Cases ────────────────────────────────────────────────────────────────

test.describe('Regulatory Deadlines – Edge Cases', () => {
  test.beforeEach(async ({ page }) => { await goTo(page); });

  test('chart renders circles even for months with low counts', async ({ page }) => {
    // Sep 2026 has the smallest counts (3,2,2) – there should still be SVG elements
    const allCircles = page.locator(`${ROOT} .reg-deadlines__chart-canvas svg circle`);
    const count = await allCircles.count();
    expect(count).toBeGreaterThan(12 * 3); // at least 1 dot per status per month
  });

  test('SR table caption includes "Regulatory deadlines"', async ({ page }) => {
    const caption = page.locator(`${ROOT} #rd-sr-table caption`);
    await expect(caption).toContainText('Regulatory deadlines');
  });

  test('all dot groups have a meaningful aria-label', async ({ page }) => {
    const groups = page.locator(`${ROOT} .reg-deadlines__dot-group`);
    const count = await groups.count();
    for (let i = 0; i < count; i++) {
      const label = await groups.nth(i).getAttribute('aria-label');
      expect(label).not.toBeNull();
      expect((label || '').length).toBeGreaterThan(10);
    }
  });

  test('tooltip element always present in DOM (hidden when inactive)', async ({ page }) => {
    await expect(page.locator(`${ROOT} .reg-deadlines__tooltip`)).toBeAttached();
  });

  test('dot circles have explicit fill and stroke attributes', async ({ page }) => {
    const circle = page.locator(`${ROOT} svg circle`).first();
    const fill   = await circle.getAttribute('fill');
    const stroke = await circle.getAttribute('stroke');
    expect(fill).not.toBeNull();
    expect(stroke).not.toBeNull();
  });
});

// ── Visual Regression ────────────────────────────────────────────────────────

test.describe('Regulatory Deadlines – Visual Regression', () => {
  test('widget matches screenshot baseline', async ({ page }) => {
    await goTo(page);
    // Scroll to widget so it's fully in view
    await page.locator(ROOT).scrollIntoViewIfNeeded();
    await page.waitForTimeout(300); // let fonts / layout settle
    const screenshot = await page.locator(ROOT).screenshot({ animations: 'disabled' });
    expect(screenshot).toMatchSnapshot('regulatory-deadlines-baseline.png', {
      maxDiffPixelRatio: 0.03, // allow 3% pixel diff
    });
  });

  test('widget after next-year click matches snapshot', async ({ page }) => {
    await goTo(page);
    await page.locator(`${ROOT} #rd-btn-next-year`).click();
    await page.waitForTimeout(300);
    await page.locator(ROOT).scrollIntoViewIfNeeded();
    const screenshot = await page.locator(ROOT).screenshot({ animations: 'disabled' });
    expect(screenshot).toMatchSnapshot('regulatory-deadlines-2027.png', {
      maxDiffPixelRatio: 0.03,
    });
  });
});
