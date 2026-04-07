/**
 * Regulatory Deadlines – Timeline Chart
 * Renders an SVG dot-plot per month, driven by local data.
 * Accessible: keyboard-navigable, ARIA live region for year, SR table.
 */

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// ---------- Mock data (dots per month per status) ----------
const CHART_DATA = {
  2025: {
    Jan: { notCompliant: 4, noStatus: 6, compliant: 3 },
    Feb: { notCompliant: 3, noStatus: 4, compliant: 2 },
    Mar: { notCompliant: 5, noStatus: 3, compliant: 4 },
    Apr: { notCompliant: 7, noStatus: 3, compliant: 2 },
    May: { notCompliant: 3, noStatus: 5, compliant: 3 },
    Jun: { notCompliant: 4, noStatus: 4, compliant: 4 },
    Jul: { notCompliant: 5, noStatus: 4, compliant: 5 },
    Aug: { notCompliant: 4, noStatus: 3, compliant: 3 },
    Sep: { notCompliant: 2, noStatus: 2, compliant: 3 },
    Oct: { notCompliant: 4, noStatus: 3, compliant: 4 },
    Nov: { notCompliant: 4, noStatus: 4, compliant: 3 },
    Dec: { notCompliant: 4, noStatus: 3, compliant: 5 },
  },
  2026: {
    Jan: { notCompliant: 5, noStatus: 5, compliant: 3 },
    Feb: { notCompliant: 4, noStatus: 3, compliant: 2 },
    Mar: { notCompliant: 6, noStatus: 4, compliant: 2 },
    Apr: { notCompliant: 9, noStatus: 4, compliant: 3 },
    May: { notCompliant: 4, noStatus: 3, compliant: 3 },
    Jun: { notCompliant: 5, noStatus: 4, compliant: 3 },
    Jul: { notCompliant: 6, noStatus: 5, compliant: 4 },
    Aug: { notCompliant: 5, noStatus: 4, compliant: 3 },
    Sep: { notCompliant: 3, noStatus: 2, compliant: 2 },
    Oct: { notCompliant: 5, noStatus: 4, compliant: 3 },
    Nov: { notCompliant: 5, noStatus: 3, compliant: 3 },
    Dec: { notCompliant: 5, noStatus: 4, compliant: 4 },
  },
  2027: {
    Jan: { notCompliant: 3, noStatus: 4, compliant: 4 },
    Feb: { notCompliant: 2, noStatus: 3, compliant: 4 },
    Mar: { notCompliant: 4, noStatus: 2, compliant: 5 },
    Apr: { notCompliant: 5, noStatus: 3, compliant: 4 },
    May: { notCompliant: 2, noStatus: 4, compliant: 5 },
    Jun: { notCompliant: 3, noStatus: 3, compliant: 5 },
    Jul: { notCompliant: 4, noStatus: 3, compliant: 6 },
    Aug: { notCompliant: 3, noStatus: 2, compliant: 5 },
    Sep: { notCompliant: 1, noStatus: 2, compliant: 4 },
    Oct: { notCompliant: 2, noStatus: 3, compliant: 5 },
    Nov: { notCompliant: 2, noStatus: 2, compliant: 5 },
    Dec: { notCompliant: 3, noStatus: 3, compliant: 6 },
  },
};

// ---------- Token helpers (read CSS vars from :root) ----------
function token(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// ---------- SVG helpers ----------
const SVG_NS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

// ---------- Chart renderer ----------
function renderChart(widget, year) {
  const svgWrap = widget.querySelector('.reg-deadlines__chart-canvas');
  if (!svgWrap) return;

  // Resolve dot colours from tokens (fallback to hex)
  const colours = {
    notCompliant: {
      fill:   token('--saf-color-data-viz-orange-200') || '#e68c66',
      stroke: token('--saf-color-data-viz-orange-700') || '#561a00',
    },
    noStatus: {
      fill:   token('--saf-color-data-viz-sky-200') || '#6bacee',
      stroke: token('--saf-color-data-viz-sky-700') || '#032e5b',
    },
    compliant: {
      fill:   token('--saf-color-data-viz-lime-200') || '#bce0a2',
      stroke: token('--saf-color-data-viz-lime-700') || '#1f473d',
    },
  };

  const DATA = CHART_DATA[year] || CHART_DATA[2026];
  const monthKeys = Object.keys(DATA);

  // Layout constants
  const DOT_R      = 4;     // radius px
  const DOT_GAP    = 2;     // gap between dots in same col
  const COL_GAP    = 3;     // gap between status columns
  const MONTH_PAD  = 6;     // horizontal pad between months
  const HEIGHT     = 160;   // drawable area height
  const SVG_H      = 180;

  // Clear previous drawing
  while (svgWrap.firstChild) svgWrap.removeChild(svgWrap.firstChild);
  // Use a real SVG element
  const svg = svgEl('svg', {
    role: 'presentation',
    'aria-hidden': 'true',
    focusable: 'false',
    height: SVG_H,
    style: 'width:100%;display:block;overflow:visible',
  });
  svgWrap.appendChild(svg);

  // Use ResizeObserver to get actual width
  const draw = () => {
    const width = svgWrap.getBoundingClientRect().width || 900;
    svg.setAttribute('viewBox', `0 0 ${width} ${SVG_H}`);

    // Clear old content
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const colW = (DOT_R * 2);          // width of one status column
    const groupW = colW * 3 + COL_GAP * 2; // 3 cols per month
    const monthW = (width - MONTH_PAD * (monthKeys.length - 1)) / monthKeys.length;

    // Accessibility: one <g> per month, keyboard-focusable
    monthKeys.forEach((monthKey, mIdx) => {
      const monthData = DATA[monthKey];
      const monthX = mIdx * (monthW + MONTH_PAD);
      const cx = monthX + monthW / 2;

      const monthGroup = svgEl('g', {
        tabindex: '0',
        role: 'group',
        'aria-label': buildMonthAriaLabel(monthKey, monthData, year),
        class: 'reg-deadlines__dot-group',
        'data-month': monthKey,
        'data-year': year,
      });
      svg.appendChild(monthGroup);

      // Keyboard tooltip
      monthGroup.addEventListener('focus', (e) => showTooltip(widget, e.currentTarget, monthKey, monthData));
      monthGroup.addEventListener('blur',  () => hideTooltip(widget));
      monthGroup.addEventListener('mouseleave', () => hideTooltip(widget));

      // Three status columns
      const statuses = [
        { key: 'notCompliant', count: monthData.notCompliant, ...colours.notCompliant },
        { key: 'noStatus',     count: monthData.noStatus,     ...colours.noStatus     },
        { key: 'compliant',    count: monthData.compliant,    ...colours.compliant    },
      ];

      const totalCols = 3;
      const totalGroupW = totalCols * colW + (totalCols - 1) * COL_GAP;
      const groupStartX = cx - totalGroupW / 2;

      statuses.forEach((status, sIdx) => {
        const colX = groupStartX + sIdx * (colW + COL_GAP) + DOT_R;

        for (let i = 0; i < status.count; i++) {
          const cy = HEIGHT - DOT_R - i * (DOT_R * 2 + DOT_GAP);
          const circle = svgEl('circle', {
            cx: colX,
            cy: cy,
            r: DOT_R,
            fill: status.fill,
            stroke: status.stroke,
            'stroke-width': '1',
            'data-status': status.key,
          });
          monthGroup.appendChild(circle);
        }
      });

      // Invisible hover hit-area for tooltip
      const hitArea = svgEl('rect', {
        x: monthX,
        y: 0,
        width: monthW,
        height: HEIGHT,
        fill: 'transparent',
        role: 'presentation',
      });
      hitArea.addEventListener('mouseenter', () => showTooltip(widget, hitArea, monthKey, monthData));
      hitArea.addEventListener('mouseleave', () => hideTooltip(widget));
      monthGroup.appendChild(hitArea);
    });
  };

  draw();

  // Redraw on resize
  const ro = new ResizeObserver(() => draw());
  ro.observe(svgWrap);
  // Store for cleanup
  svgWrap._ro = ro;

  // Populate SR table
  updateSRTable(widget, year, DATA);
}

// ---------- Accessible month label ----------
function buildMonthAriaLabel(monthKey, data, year) {
  const full = MONTHS_FULL[MONTHS.indexOf(monthKey)] || monthKey;
  const total = data.notCompliant + data.noStatus + data.compliant;
  return `${full} ${year}: ${total} deadlines — ${data.notCompliant} not compliant, ${data.noStatus} no status, ${data.compliant} compliant`;
}

// ---------- Screen-reader table ----------
function updateSRTable(widget, year, data) {
  const tbody = widget.querySelector('#reg-deadlines-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  const months = Object.keys(data);
  months.forEach(month => {
    const d = data[month];
    const total = d.notCompliant + d.noStatus + d.compliant;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <th scope="row">${MONTHS_FULL[MONTHS.indexOf(month)] || month} ${year}</th>
      <td>${d.notCompliant}</td>
      <td>${d.noStatus}</td>
      <td>${d.compliant}</td>
      <td>${total}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ---------- Tooltip helpers ----------
function showTooltip(widget, anchor, monthKey, data) {
  const tooltip = widget.querySelector('.reg-deadlines__tooltip');
  if (!tooltip) return;
  const total = data.notCompliant + data.noStatus + data.compliant;
  tooltip.querySelector('.reg-deadlines__tooltip-count').textContent = total;
  tooltip.querySelector('.reg-deadlines__tooltip-detail').textContent =
    `${data.notCompliant} not compliant`;

  // Position relative to anchor
  const rect = anchor.getBoundingClientRect
    ? anchor.getBoundingClientRect()
    : { top: 0, left: 0, width: 0 };
  tooltip.style.left = `${rect.left + rect.width / 2}px`;
  tooltip.style.top  = `${rect.top - 60}px`;
  tooltip.classList.add('reg-deadlines__tooltip--visible');
}

function hideTooltip(widget) {
  const tooltip = widget.querySelector('.reg-deadlines__tooltip');
  if (tooltip) tooltip.classList.remove('reg-deadlines__tooltip--visible');
}

// ---------- Year navigation ----------
function initYearNav(widget) {
  let currentYear = 2026;

  const yearEl  = widget.querySelector('.reg-deadlines__year');
  const btnPrev = widget.querySelector('#rd-btn-prev-year');
  const btnNext = widget.querySelector('#rd-btn-next-year');
  const minYear = Math.min(...Object.keys(CHART_DATA).map(Number));
  const maxYear = Math.max(...Object.keys(CHART_DATA).map(Number));

  const update = () => {
    yearEl.textContent = currentYear;
    const hasPrev = CHART_DATA[currentYear - 1] !== undefined;
    const hasNext = CHART_DATA[currentYear + 1] !== undefined;
    btnPrev.disabled = !hasPrev;
    btnPrev.setAttribute('aria-disabled', String(!hasPrev));
    btnNext.disabled = !hasNext;
    btnNext.setAttribute('aria-disabled', String(!hasNext));
    renderChart(widget, currentYear);
  };

  btnPrev?.addEventListener('click', () => {
    if (currentYear > minYear) { currentYear--; update(); }
  });
  btnNext?.addEventListener('click', () => {
    if (currentYear < maxYear) { currentYear++; update(); }
  });

  // Initial render
  update();
}

// ---------- View toggle (Timeline / Table) ----------
function initViewToggle(widget) {
  const btns  = widget.querySelectorAll('.reg-deadlines__view-toggle saf-button');
  const chart = widget.querySelector('.reg-deadlines__chart-section');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => {
        b.setAttribute('appearance', 'secondary');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.setAttribute('appearance', 'primary');
      btn.setAttribute('aria-pressed', 'true');
    });
  });
}

// ---------- Bootstrap ----------
function init() {
  const widgets = document.querySelectorAll('.reg-deadlines');
  widgets.forEach(widget => {
    initViewToggle(widget);
    initYearNav(widget);
  });
}

// Wait for custom elements to upgrade
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
