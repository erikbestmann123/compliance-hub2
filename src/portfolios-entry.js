import './saffron-base.js';
import '@thomsonreuters/saffron-core-styles-prototyping-only/wijmo.css';
import {
  SafAccordion,
  SafAccordionItem,
  SafBreadcrumb,
  SafBreadcrumbItem,
  SafButtonGroup,
  SafCard,
  SafDivider,
  SafLogo,
  SafMenu,
  SafMenuItem,
  SafOption,
  SafPagination,
  SafProductHeader,
  SafProductHeaderItem,
  SafSearchField,
  SafSideNav,
  SafSrOnly,
  SafTab,
  SafTabPanel,
  SafTabs,
  SafTooltip,
} from '@thomsonreuters/saffron-core-components-prototyping-only';
import { setLicenseKey } from '@grapecity/wijmo';
import { FlexGrid } from '@grapecity/wijmo.grid';
import { initObligationsGrids } from './obligations-grids.js';

SafAccordion();
SafAccordionItem();
SafBreadcrumb();
SafBreadcrumbItem();
SafButtonGroup();
SafCard();
SafDivider();
SafLogo();
SafMenu();
SafMenuItem();
SafOption();
SafPagination();
SafProductHeader();
SafProductHeaderItem();
SafSearchField();
SafSideNav();
SafSrOnly();
SafTab();
SafTabPanel();
SafTabs();
SafTooltip();

const wijmoKey = import.meta.env.VITE_WIJMO_LICENSE_KEY;
if (wijmoKey) setLicenseKey(wijmoKey);

function initPortfolioActions() {
  const actionsBtn = document.getElementById('btn-portfolio-actions');
  const actionsMenu = document.getElementById('portfolio-actions-menu');
  if (!actionsBtn || !actionsMenu) return;

  actionsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = !actionsMenu.hidden;
    actionsMenu.hidden = isOpen;
    actionsBtn.setAttribute('aria-expanded', String(!isOpen));
  });

  document.addEventListener('click', () => {
    actionsMenu.hidden = true;
    actionsBtn.setAttribute('aria-expanded', 'false');
  });

  actionsMenu.addEventListener('click', () => {
    actionsMenu.hidden = true;
    actionsBtn.setAttribute('aria-expanded', 'false');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !actionsMenu.hidden) {
      actionsMenu.hidden = true;
      actionsBtn.setAttribute('aria-expanded', 'false');
      actionsBtn.focus();
    }
  });
}

function init() {
  initObligationsGrids(FlexGrid);
  initPortfolioActions();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
