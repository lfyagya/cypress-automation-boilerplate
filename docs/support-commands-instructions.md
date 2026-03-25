# Support Commands Authoring Guide

## Command File Structure

Every command file follows this structure:

```js
/**
 * @fileoverview <Module> commands.
 */

import { MODULE_CONFIG } from "@configs/api/modules/<name>/<name>.api";
import { MODULE_UI } from "@configs/ui/modules/<name>/<name>.ui";

// ─── Section Name ─────────────────────────────────────────────────────────────

Cypress.Commands.add("verbNounAction", (args) => {
  // implementation
});
```

## Naming Rules

Commands are **verb-first**, hyphenated by module:

| Action              | Pattern                     | Example                    |
| ------------------- | --------------------------- | -------------------------- |
| Load a list         | `load<Module>List`          | `loadPaymentList`          |
| Visit a page        | `visit<Module>`             | `visitPayments`            |
| Search / filter     | `search<Module>`            | `searchPayments`           |
| Assert something    | `assert<Module><State>`     | `assertPaymentLoaded`      |
| Create a record     | `create<Module>`            | `createPayment`            |
| Register intercepts | `intercept<Module>Requests` | `interceptPaymentRequests` |

## Writing a Command: Step by Step

### Step 1 — Import configs

```js
import { PAYMENTS_CONFIG } from "@configs/api/modules/payments/payments.api";
import { PAYMENTS_UI } from "@configs/ui/modules/payments/payments.ui";
```

### Step 2 — Register intercept command first

```js
Cypress.Commands.add("interceptPaymentRequests", () => {
  cy.apiInterceptAll(PAYMENTS_CONFIG);
});
```

### Step 3 — Write a visit command

```js
Cypress.Commands.add("visitPayments", () => {
  cy.interceptPaymentRequests();
  cy.visit(ROUTES.PAYMENTS.ROOT);
  cy.apiWait("@PAYMENT_LIST");
});
```

### Step 4 — Write interaction commands

```js
Cypress.Commands.add("searchPayments", (query) => {
  cy.apiIntercept(PAYMENTS_CONFIG, "PAYMENT_SEARCH");
  cy.get(PAYMENTS_UI.LIST.SEARCH_INPUT).clear().type(query);
  cy.get(PAYMENTS_UI.LIST.SEARCH_BTN).click();
  cy.apiWait("@PAYMENT_SEARCH");
});
```

### Step 5 — Write assertion commands

```js
Cypress.Commands.add("assertPaymentListLoaded", () => {
  cy.get(PAYMENTS_UI.LIST.TABLE).should("be.visible");
  cy.get(PAYMENTS_UI.LIST.LOADING_SPINNER).should("not.exist");
});
```

### Step 6 — Register in commands.js

```js
// cypress/support/commands.js
import "./commands/modules/payments.commands";
```

## What NOT to Put in a Command

| Anti-pattern                                | Why                                                                       |
| ------------------------------------------- | ------------------------------------------------------------------------- |
| `cy.wait(3000)`                             | Flaky — replace with `cy.apiWait('@alias')` or `.should()` chain          |
| Hardcoded URLs                              | Import from `@configs/app/routes`                                         |
| Raw CSS selectors like `.btn`               | Import from UI config using `[data-cy="..."]`                             |
| Multiple API patterns for the same endpoint | Centralise in API config                                                  |
| Test assertions that belong in a spec       | Commands are actions; assertions should be in tests or `assert*` commands |

## Common Anti-Pattern: Dual Ownership

```js
// ❌ Wrong — spec controls navigation AND interaction
it("searches payments", () => {
  cy.visit("/payments");
  cy.get(".search-input").type("test");
  cy.get(".search-btn").click();
  cy.wait(2000);
});

// ✅ Correct — spec calls one command
it("searches payments", () => {
  cy.visitPayments();
  cy.searchPayments("test");
  cy.assertTableHasRows('[data-cy="payments-table"]', 1);
});
```
