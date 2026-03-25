---
description: Use when adding a new Cypress command file for a module or dashboard feature.
agent: agent
model: Claude Sonnet 4.6
---

Generate a production-ready Cypress command file.

## Inputs

- Module name (kebab-case): `${input:moduleName}` (e.g. `loan-applications`)
- Command scope: `${input:scope}` (common | modules | dashboards)
- Commands to generate: `${input:commands}` (e.g. `navigateToDashboard, interceptAPIs, assertTableLoaded`)
- Related API config import: `${input:apiConfig}` (e.g. `@configs/api/modules/loan-applications/loan-applications.api.js`)
- Related UI config import: `${input:uiConfig}` (e.g. `@configs/ui/modules/loan-applications/loan-applications.ui.js`)

## Output: `cypress/support/commands/${input:scope}/${input:moduleName}.commands.js`

## Pattern

```javascript
/**
 * @fileoverview ${input:moduleName} Commands
 * Command owner for ${input:moduleName} module interactions.
 * Registered in cypress/support/commands.js
 */

import { MODULE_API } from "${input:apiConfig}";
import { MODULE_UI } from "${input:uiConfig}";

/**
 * Navigate to the ${input:moduleName} dashboard.
 * Relies on cy.navigateToDashboard (common navigation command).
 */
Cypress.Commands.add("navigate${input:moduleName|pascalCase}", () => {
  cy.navigateToDashboard("${input:moduleLabel}");
});

/**
 * Register all API intercepts for ${input:moduleName}.
 * Must be called BEFORE cy.visit() per Cypress best practices.
 */
Cypress.Commands.add(
  "intercept${input:moduleName|pascalCase}APIs",
  (options = {}) => {
    cy.apiInterceptAll(MODULE_API, options);
  },
);

/**
 * Assert the ${input:moduleName} table is loaded and visible.
 */
Cypress.Commands.add("assert${input:moduleName|pascalCase}TableLoaded", () => {
  cy.apiWait(MODULE_API.RESOURCE_LIST);
  cy.get(MODULE_UI.TABLE).should("be.visible");
  cy.get(MODULE_UI.TABLE_ROW).should("have.length.greaterThan", 0);
});
```

## Rules

- One command name, one owner file — check for duplicates before creating
- Register the new file in `cypress/support/commands.js`
- Use config imports for all selectors and API entries
- No `cy.wait(ms)` — use `cy.apiWait(apiEntry)`
- Verb-first command names: `navigate...`, `intercept...`, `assert...`, `submit...`, `open...`
