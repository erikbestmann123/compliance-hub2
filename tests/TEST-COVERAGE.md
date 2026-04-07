# Compliance Summary — Test Coverage Report

## Summary

| Category             | Tests | Passed | Failed |
|----------------------|-------|--------|--------|
| Rendering            | 12    | —      | —      |
| Badge Variants       | 6     | —      | —      |
| Interactivity        | 2     | —      | —      |
| Keyboard Navigation  | 2     | —      | —      |
| Responsiveness       | 3     | —      | —      |
| Edge Cases           | 2     | —      | —      |
| Visual Regression    | 2     | —      | —      |
| **Unit total**       | **29**|        |        |
| WCAG axe scan        | 1     | —      | —      |
| WCAG 1.1.1           | 3     | —      | —      |
| WCAG 1.3.1           | 5     | —      | —      |
| WCAG 2.1.1/2.1.2     | 2     | —      | —      |
| WCAG 2.4.6           | 3     | —      | —      |
| WCAG 2.4.7           | 1     | —      | —      |
| WCAG 4.1.2           | 3     | —      | —      |
| **A11y total**       | **18**|        |        |
| **Grand total**      | **47**|        |        |

> Status columns are populated by running `npm test`.

---

## UI Element → Test Mapping

### Structural Elements

| UI Element                         | Test File                   | Test Name(s)                                          |
|------------------------------------|-----------------------------|-------------------------------------------------------|
| `#saffron_implmentation_100`       | unit.spec                   | renders wrapping article                              |
| `.compliance-summary__eyebrow`     | unit.spec                   | renders eyebrow "Digital controls"                    |
| `h2#compliance-title`              | unit.spec                   | renders heading "Compliance summary"                  |
| `article[aria-labelledby]`         | a11y.spec                   | article labelled with aria-labelledby                 |
| `section[aria-labelledby=…]`       | a11y.spec                   | panels use section with aria-labelledby               |
| `h2 > h3` hierarchy                | a11y.spec                   | headings follow correct h2 > h3 hierarchy             |
| `dl.compliance-summary__stats`     | a11y.spec                   | stats use dl/dt/dd structure                          |
| `.compliance-summary__panels[role] `| a11y.spec                  | panels group labelled with aria-label                 |

### Year Filter

| UI Element                         | Test File                   | Test Name(s)                                          |
|------------------------------------|-----------------------------|-------------------------------------------------------|
| `label[for="year-select"]`         | unit.spec                   | renders year label                                    |
| `saf-select#year-select`           | unit.spec                   | renders saf-select with 2025 selected                 |
| `saf-select` — keyboard change     | unit.spec                   | year select can be changed to 2024                    |
| `saf-select` — Arrow key           | unit.spec                   | year select is keyboard-operable                      |
| `saf-select` — Tab reachable       | a11y.spec                   | saf-select is reachable via Tab                       |
| `saf-select` — visible focus       | a11y.spec                   | saf-select has a visible focus indicator              |
| `label` + `aria-labelledby`        | a11y.spec                   | select has aria-labelledby pointing to label          |

### Stats Panels

| UI Element                         | Test File                   | Test Name(s)                                          |
|------------------------------------|-----------------------------|-------------------------------------------------------|
| All deadlines heading              | unit.spec                   | renders "All deadlines" panel heading                 |
| All deadlines stat values (78, 20) | unit.spec                   | correct stat values for All deadlines                 |
| Your deadlines heading             | unit.spec                   | renders "Your deadlines" panel heading                |
| Your deadlines stat values (35, 7) | unit.spec                   | correct stat values for Your deadlines                |
| `saf-divider` elements             | a11y.spec                   | saf-divider has role separator/presentation           |
| `saf-divider[aria-hidden]`         | a11y.spec                   | decorative dividers are aria-hidden                   |

### Badges

| UI Element                         | Test File                   | Test Name(s)                                          |
|------------------------------------|-----------------------------|-------------------------------------------------------|
| All deadlines — success (18)       | unit.spec + a11y.spec        | badge variants + aria-label                           |
| All deadlines — warning (27)       | unit.spec + a11y.spec        | badge variants + aria-label                           |
| All deadlines — info (33)          | unit.spec + a11y.spec        | badge variants + aria-label                           |
| Your deadlines — success (8)       | unit.spec + a11y.spec        | badge variants + aria-label                           |
| Your deadlines — warning (6)       | unit.spec + a11y.spec        | badge variants + aria-label                           |
| Your deadlines — info (21)         | unit.spec + a11y.spec        | badge variants + aria-label                           |
| Badge icons (`aria-hidden="true"`) | a11y.spec                   | all saf-icon elements inside badges are aria-hidden   |
| Notification badge (corner "1")    | unit.spec + a11y.spec        | renders notification badge; has aria-label            |

### Responsiveness

| Viewport      | Test File | Test Name(s)                                       |
|---------------|-----------|----------------------------------------------------|
| Desktop 960px | unit.spec | panels are side-by-side on desktop                 |
| Mobile 375px  | unit.spec | panels stack vertically on mobile                  |
| Min-width 320px| unit.spec | all content still visible at 320px                 |
| Min-width 280px| unit.spec | component visible and not clipped at 280px         |

### Visual Regression

| Snapshot                        | Test File | Threshold |
|---------------------------------|-----------|-----------|
| compliance-summary-desktop.png  | unit.spec | 2%        |
| compliance-summary-mobile.png   | unit.spec | 2%        |

---

## WCAG 2.2 Criteria Coverage

| Criterion | Description                      | Covered By                              |
|-----------|----------------------------------|-----------------------------------------|
| 1.1.1     | Non-text content                 | aria-hidden icons, aria-label badges    |
| 1.3.1     | Info and Relationships           | semantic articleHTML, dl/dt/dd, headings|
| 1.3.2     | Meaningful Sequence              | DOM order matches visual reading order  |
| 1.4.3     | Contrast Minimum                 | axe automated scan (color tokens)       |
| 2.1.1     | Keyboard accessible              | Tab navigation, select keyboard ops     |
| 2.1.2     | No Keyboard Trap                 | 20-Tab loop test                        |
| 2.4.3     | Focus Order                      | Tab sequence test                       |
| 2.4.6     | Headings and Labels              | Visible label, aria-labelledby          |
| 2.4.7     | Focus Visible                    | outline/box-shadow check on focus       |
| 3.1.1     | Language of Page                 | `<html lang="en-US">`                   |
| 4.1.2     | Name, Role, Value                | select role, article attrs, divider role|

---

## Running the Tests

```bash
# Install deps (requires Artifactory token refresh)
npm install

# Run all tests
npm test

# Run only accessibility tests
npm run test:a11y

# Run only unit/integration tests
npm run test:unit

# Generate HTML coverage report
npm run test:coverage
```

> **Note:** Visual regression tests create reference screenshots on first run (`--update-snapshots`).
> Re-run without that flag on subsequent runs to detect regressions.
