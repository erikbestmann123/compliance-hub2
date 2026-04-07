/**
 * regulatory-deadlines.a11y.spec.js
 *
 * WCAG 2.2 Accessibility tests for the Regulatory Deadlines Timeline Widget.
 *
 * Covers:
 *  - Proper ARIA roles, labels, and live regions
 *  - Color contrast (via axe)
 *  - Keyboard navigation and focus order
 *  - Screen-reader compatibility (semantic structure)
 *  - Visible focus indicators
 *  - Focus order (logical tab sequence)
 *
 * Tool: Playwright Test + @axe-core/playwright
 */

import { test, expect }    from '@playwright/test';
import AxeBuilder          from '@axe-core/playwright';

const PAGE = '/compliance-summary.html';
const ROOT = '.reg-deadlines';

// ── Setup ────────────────────────────────────────────────────────────────────

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
  await page.waitForSelector('.reg-deadlines__chart-canvas svg', { timeout: 5000 });
}

// ── Axe automated a11y scan ──────────────────────────────────────────────────

test.describe('Regulatory Deadlines – Axe Automated A11y', () => {
  test('passes axe-core scan with no critical violations', async ({ page }) => {
    await goTo(page);
    const results = await new AxeBuilder({ page })
      .include(ROOT)
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .disableRules([
        // SVG presentation elements are intentionally aria-hidden
        'aria-hidden-body',
      ])
      .analyze();

    const critical = results.violations.filter(v => v.impact === 'critical');
    const serious  = results.violations.filter(v => v.impact === 'serious');

    if (critical.length || serious.length) {
      console.error('A11y violations:\n', JSON.stringify([...critical, ...serious], null, 2));
    }

    expect(critical).toHaveLength(0);
    expect(serious).toHaveLength(0);
  });

  test('no color contrast violations in legend text', async ({ page }) => {
    await goTo(page);
    const results = await new AxeBuilder({ page })
      .include(`${ROOT} .reg-deadlines__legend`)
      .withTags(['wcag2aa'])
      .analyze();

    const contrastViolations = results.violations.filter(v => v.id === 'color-contrast');
    expect(contrastViolations).toHaveLength(0);
  });

  test('no color contrast violations in heading area', async ({ page }) => {
    await goTo(page);
    const results = await new AxeBuilder({ page })
      .include(`${ROOT} .reg-deadlines__header`)
      .withTags(['wcag2aa'])
      .analyze();

    const contrastViolations = results.violations.filter(v => v.id === 'color-contrast');
    expect(contrastViolations).toHaveLength(0);
  });
});

// ── Landmark & Heading Structure ─────────────────────────────────────────────

test.describe('Regulatory Deadlines – Landmark & Heading Structure', () => {
  test.beforeEach(async ({ page }) => { await goTo(page); });

  test('widget is wrapped in <article> landmark', async ({ page }) => {
    const tagName = await page.locator(ROOT).evaluate(el => el.tagName.toLowerCase());
    expect(tagName).toBe('article');
  });

  test('article has aria-labelledby pointing to h2', async ({ page }) => {
    const labelId = await page.locator(ROOT).getAttribute('aria-labelledby');
    expect(labelId).toBe('rd-title');
    const h2 = page.locator(`#${labelId}`);
    await expect(h2).toContainText('Regulatory deadlines');
  });

  test('article has descriptive aria-roledescription', async ({ page }) => {
    const rd = await page.locator(ROOT).getAttribute('aria-roledescription');
    expect(rd).toBeTruthy();
  });

  test('chart section is a <section> with aria-label', async ({ page }) => {
    const section = page.locator(`${ROOT} .reg-deadlines__chart-section`);
    const tag  = await section.evaluate(el => el.tagName.toLowerCase());
    const label = await section.getAttribute('aria-label');
    expect(tag).toBe('section');
    expect(label).toBeTruthy();
  });

  test('footer element is present', async ({ page }) => {
    const footer = page.locator(`${ROOT} footer.reg-deadlines__footer`);
    const tag = await footer.evaluate(el => el.tagName.toLowerCase());
    expect(tag).toBe('footer');
  });
});

// ── ARIA Labels & Roles ──────────────────────────────────────────────────────

test.describe('Regulatory Deadlines – ARIA Labels & Roles', () => {
  test.beforeEach(async ({ page }) => { await goTo(page); });

  test('controls group has aria-label="Chart display controls"', async ({ page }) => {
    const group = page.locator(`${ROOT} .reg-deadlines__controls`);
    expect(await group.getAttribute('aria-label')).toBe('Chart display controls');
  });

  test('year navigation group has aria-label', async ({ page }) => {
    const nav = page.locator(`${ROOT} .reg-deadlines__year-nav`);
    expect(await nav.getAttribute('aria-label')).toBeTruthy();
  });

  test('prev-year button has a11y-aria-label "Previous year"', async ({ page }) => {
    const btn = page.locator(`${ROOT} #rd-btn-prev-year`);
    expect(await btn.getAttribute('a11y-aria-label')).toBe('Previous year');
  });

  test('next-year button has a11y-aria-label "Next year"', async ({ page }) => {
    const btn = page.locator(`${ROOT} #rd-btn-next-year`);
    expect(await btn.getAttribute('a11y-aria-label')).toBe('Next year');
  });

  test('chart wrap has role="img"', async ({ page }) => {
    const wrap = page.locator(`${ROOT} .reg-deadlines__chart-wrap`);
    expect(await wrap.getAttribute('role')).toBe('img');
  });

  test('chart wrap has descriptive aria-label', async ({ page }) => {
    const label = await page.locator(`${ROOT} .reg-deadlines__chart-wrap`).getAttribute('aria-label');
    expect(label).toBeTruthy();
    expect((label || '').length).toBeGreaterThan(20);
  });

  test('svg inside chart is aria-hidden', async ({ page }) => {
    const svg = page.locator(`${ROOT} .reg-deadlines__chart-canvas svg`);
    expect(await svg.getAttribute('aria-hidden')).toBe('true');
  });

  test('each dot group has role="group"', async ({ page }) => {
    const groups = page.locator(`${ROOT} .reg-deadlines__dot-group`);
    const count = await groups.count();
    for (let i = 0; i < count; i++) {
      expect(await groups.nth(i).getAttribute('role')).toBe('group');
    }
  });

  test('each dot group has a non-empty aria-label', async ({ page }) => {
    const groups = page.locator(`${ROOT} .reg-deadlines__dot-group`);
    const count = await groups.count();
    for (let i = 0; i < count; i++) {
      const label = await groups.nth(i).getAttribute('aria-label');
      expect(label).toBeTruthy();
      // Should mention the month name
      const months = ['January','February','March','April','May','June',
                      'July','August','September','October','November','December'];
      const hasMonth = months.some(m => (label || '').includes(m));
      expect(hasMonth).toBe(true);
    }
  });

  test('legend list has role="list" and aria-label', async ({ page }) => {
    const legend = page.locator(`${ROOT} .reg-deadlines__legend`);
    expect(await legend.getAttribute('role')).toBe('list');
    expect(await legend.getAttribute('aria-label')).toBe('Chart legend');
  });

  test('legend dot spans are aria-hidden', async ({ page }) => {
    const dots = page.locator(`${ROOT} .reg-deadlines__legend-dot`);
    const count = await dots.count();
    for (let i = 0; i < count; i++) {
      expect(await dots.nth(i).getAttribute('aria-hidden')).toBe('true');
    }
  });

  test('year heading has aria-live="polite" and aria-atomic="true"', async ({ page }) => {
    const yearEl = page.locator(`${ROOT} .reg-deadlines__year`);
    expect(await yearEl.getAttribute('aria-live')).toBe('polite');
    expect(await yearEl.getAttribute('aria-atomic')).toBe('true');
  });

  test('View select has an associated label', async ({ page }) => {
    const label = page.locator(`${ROOT} label[for="rd-view-select"]`);
    await expect(label).toBeAttached();
    await expect(label).toContainText('View');
  });

  test('Forecast select has an associated label', async ({ page }) => {
    const label = page.locator(`${ROOT} label[for="rd-forecast-select"]`);
    await expect(label).toBeAttached();
    await expect(label).toContainText('Forecast');
  });

  test('saf-button-group has aria-label', async ({ page }) => {
    const group = page.locator(`${ROOT} saf-button-group`);
    expect(await group.getAttribute('aria-label')).toBeTruthy();
  });

  test('"Go to deadlines" link has aria-label', async ({ page }) => {
    const link = page.locator(`${ROOT} saf-anchor.reg-deadlines__cta`);
    const label = await link.getAttribute('aria-label');
    expect(label).toBeTruthy();
  });

  test('tooltip has role="tooltip"', async ({ page }) => {
    const tip = page.locator(`${ROOT} .reg-deadlines__tooltip`);
    expect(await tip.getAttribute('role')).toBe('tooltip');
  });

  test('SR table has a <caption> element', async ({ page }) => {
    const caption = page.locator(`${ROOT} #rd-sr-table caption`);
    await expect(caption).toBeAttached();
    expect(((await caption.textContent()) || '').trim().length).toBeGreaterThan(5);
  });

  test('SR table header cells have scope="col"', async ({ page }) => {
    const ths = page.locator(`${ROOT} #rd-sr-table thead th`);
    const count = await ths.count();
    for (let i = 0; i < count; i++) {
      expect(await ths.nth(i).getAttribute('scope')).toBe('col');
    }
  });

  test('SR table row headers have scope="row"', async ({ page }) => {
    const ths = page.locator(`${ROOT} #reg-deadlines-table-body tr th`);
    const count = await ths.count();
    for (let i = 0; i < count; i++) {
      expect(await ths.nth(i).getAttribute('scope')).toBe('row');
    }
  });
});

// ── Focus Management ─────────────────────────────────────────────────────────

test.describe('Regulatory Deadlines – Focus Management', () => {
  test.beforeEach(async ({ page }) => { await goTo(page); });

  test('no element has tabindex > 0 (natural tab order maintained)', async ({ page }) => {
    const positiveTabindex = await page.locator(`${ROOT} [tabindex]:not([tabindex="0"]):not([tabindex="-1"])`).count();
    // SVG dot groups use tabindex=0; no tabindex > 0 should exist
    const badTabindex = await page.evaluate(() => {
      const widget = document.querySelector('.reg-deadlines');
      if (!widget) return 0;
      const all = widget.querySelectorAll('[tabindex]');
      return [...all].filter(el => Number(el.getAttribute('tabindex')) > 0).length;
    });
    expect(badTabindex).toBe(0);
  });

  test('dot groups are focusable via tabindex=0', async ({ page }) => {
    const groups = page.locator(`${ROOT} .reg-deadlines__dot-group`);
    const first  = groups.first();
    expect(await first.getAttribute('tabindex')).toBe('0');
  });

  test('focused element has a visible focus indicator', async ({ page }) => {
    await page.locator(`${ROOT} #rd-btn-prev-year`).focus();
    const outlineStyle = await page.evaluate(() => {
      const el = /** @type {HTMLElement|null} */ (document.activeElement);
      return el ? getComputedStyle(el).outlineStyle : '';
    });
    // Must have some outline (not 'none')
    expect(outlineStyle).not.toBe('none');
    expect(outlineStyle).not.toBe('');
  });

  test('focused dot group shows outline', async ({ page }) => {
    const group = page.locator(`${ROOT} .reg-deadlines__dot-group`).first();
    await group.focus();
    const outline = await group.evaluate(el => getComputedStyle(el).outline);
    expect(outline).not.toMatch(/none|0px none/);
  });
});

// ── Semantic HTML ─────────────────────────────────────────────────────────────

test.describe('Regulatory Deadlines – Semantic HTML', () => {
  test.beforeEach(async ({ page }) => { await goTo(page); });

  test('eyebrow paragraph is aria-hidden (decorative)', async ({ page }) => {
    const eyebrow = page.locator(`${ROOT} .reg-deadlines__eyebrow`);
    expect(await eyebrow.getAttribute('aria-hidden')).toBe('true');
  });

  test('month axis div is aria-hidden (decorative, SR table used instead)', async ({ page }) => {
    const axis = page.locator(`${ROOT} .reg-deadlines__axis`);
    expect(await axis.getAttribute('aria-hidden')).toBe('true');
  });

  test('saf-icon inside nav buttons are aria-hidden', async ({ page }) => {
    const icons = page.locator(`${ROOT} .reg-deadlines__year-nav saf-icon`);
    const count = await icons.count();
    for (let i = 0; i < count; i++) {
      expect(await icons.nth(i).getAttribute('aria-hidden')).toBe('true');
    }
  });
});
