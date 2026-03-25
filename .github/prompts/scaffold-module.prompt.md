---
description: Generates a complete module scaffold — API config + UI config + command file + test spec — from a single prompt.
agent: agent
model: Claude Sonnet 4.6
---

# Scaffold Full Module: `${input:moduleName}`

Generate a **complete, production-ready module scaffold** for the module named `${input:moduleName}`.

## Inputs

- Module name (kebab-case): `${input:moduleName}` (e.g. `loan-applications`)
- Module display label: `${input:moduleLabel}` (e.g. `Loan Applications`)
- API base path: `${input:apiBasePath}` (e.g. `/api/loan-applications`)
- API alias prefix (2-4 chars): `${input:apiPrefix}` (e.g. `loan`)
- Primary resource (kebab-case): `${input:resource}` (e.g. `applications`)
- Route path: `${input:routePath}` (e.g. `/loan-applications/dashboard`)
- UPPER_SNAKE_CASE export const: `${input:exportConst}` (e.g. `LOAN_APPLICATIONS_API`)
- UI export const: `${input:uiExportConst}` (e.g. `LOAN_APPLICATIONS_UI`)

## What to Generate

### 1. API Config — `cypress/configs/api/modules/${input:moduleName}/${input:moduleName}.api.js`

Use `createModuleConfig` from `@core/api/api-config.factory.js`.
Include LIST, DETAILS, CREATE, UPDATE, DELETE for the primary resource.

### 2. UI Config — `cypress/configs/ui/modules/${input:moduleName}/${input:moduleName}.ui.js`

Use `Object.freeze({})` with `data-cy` selectors.
Include: CONTAINER, TABLE_ROW, ACTION_BUTTON, SEARCH_INPUT, FILTER_PANEL, SUBMIT_BUTTON, ERROR_MESSAGE.

### 3. Route Entry — `cypress/configs/app/routes.js` _(append only)_

Add a new key to `DASHBOARD_MODULES` for this module.

### 4. Command File — `cypress/support/commands/modules/${input:moduleName}.commands.js`

Include:

- `navigate${input:moduleLabel|pascalCase}Dashboard` — visits the route
- `intercept${input:moduleLabel|pascalCase}APIs` — calls `cy.apiInterceptAll`
- `assert${input:moduleLabel|pascalCase}TableLoaded` — asserts table rows visible

### 5. Register Command — `cypress/support/commands.js` _(append line)_

### 6. Test Spec — `cypress/tests/${input:moduleName}/smoke/${input:moduleName}-smoke.cy.js`

Use `cy.ensureAuthenticated()` in `before()` + `beforeEach()`.
Use `cy.session()` internally via `ensureAuthenticated`.
Set up API intercepts BEFORE `cy.visit()`.
Verify page loads, API returns 200, table is visible.

## Architecture Rules (Do Not Violate)

- No hardcoded selectors — use `${input:uiExportConst}` keys
- No hardcoded URLs — use route config
- No `cy.wait(ms)` — use `cy.apiWait()`
- No new `*.actions.js` files
- `data-cy` attributes only for selectors
