---
description: Use when creating a new Cypress UI selector config file with Object.freeze, data-cy selectors, and UPPER_SNAKE_CASE keys.
agent: agent
model: Claude Sonnet 4.6
---

Generate a production-ready UI selector config file.

## Inputs

- Module name (kebab-case): `${input:moduleName}` (e.g. `loan-applications`)
- Export constant (UPPER_SNAKE_CASE): `${input:exportConst}` (e.g. `LOAN_APPLICATIONS_UI`)
- List of UI areas: `${input:uiAreas}` (e.g. `table, filter panel, action buttons, search, modal`)

## Output: `cypress/configs/ui/modules/${input:moduleName}/${input:moduleName}.ui.js`

## Selector Priority (Industry Standard — Cypress Official)

1. `[data-cy="..."]` — **always preferred** (test-specific, decoupled from CSS/JS)
2. `[data-testid="..."]` — acceptable alternative
3. `[aria-label="..."]` — use for accessibility-aware assertions
4. `cy.contains('...')` — only when text content is part of the test assertion
5. **Never**: `.class`, `#id`, tag names — these are CSS-coupled and brittle

## Output Template

```javascript
/**
 * @fileoverview ${input:moduleName} UI Selectors
 * All selectors use data-cy attributes per Cypress best practices.
 */
export const ${input:exportConst} = Object.freeze({
  // Container
  CONTAINER:      '[data-cy="${input:moduleName}-container"]',

  // Table
  TABLE:          '[data-cy="${input:moduleName}-table"]',
  TABLE_ROW:      '[data-cy="${input:moduleName}-table-row"]',
  TABLE_EMPTY:    '[data-cy="${input:moduleName}-table-empty"]',

  // Actions
  ACTION_BUTTON:  '[data-cy="${input:moduleName}-action-btn"]',
  SUBMIT_BUTTON:  '[data-cy="${input:moduleName}-submit"]',
  CANCEL_BUTTON:  '[data-cy="${input:moduleName}-cancel"]',

  // Search & Filter
  SEARCH_INPUT:   '[data-cy="${input:moduleName}-search"]',
  FILTER_PANEL:   '[data-cy="${input:moduleName}-filter"]',
  FILTER_APPLY:   '[data-cy="${input:moduleName}-filter-apply"]',

  // Feedback
  SUCCESS_TOAST:  '[data-cy="${input:moduleName}-success-toast"]',
  ERROR_MESSAGE:  '[data-cy="${input:moduleName}-error"]',
  LOADING:        '[data-cy="${input:moduleName}-loading"]',
});
```

## Rules

- `Object.freeze()` on all exports
- All keys UPPER_SNAKE_CASE
- All values `data-cy` attributes
- No logic, no Cypress commands — constants only
- Add only selectors that actually exist in the app UI
