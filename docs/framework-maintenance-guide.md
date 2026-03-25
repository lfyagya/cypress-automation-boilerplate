# Framework Maintenance Guide

## Adding a New Module

Follow this checklist when onboarding a new feature area.

### 1. API Config

Create `cypress/configs/api/modules/<name>/<name>.api.js`:

```js
import { createModuleConfig } from "@core/api";

export const PAYMENTS_CONFIG = createModuleConfig({
  basePath: "/api/v1/payments",
  prefix: "PAYMENT",
  resources: ["LIST", "DETAILS", "CREATE", "UPDATE", "DELETE"],
  custom: [],
});
```

### 2. UI Config

Create `cypress/configs/ui/modules/<name>/<name>.ui.js`:

```js
export const PAYMENTS_UI = Object.freeze({
  LIST: {
    TABLE: '[data-cy="payments-table"]',
    SEARCH_INPUT: '[data-cy="payments-search-input"]',
  },
  FORM: {
    AMOUNT_INPUT: '[data-cy="payments-form-amount"]',
    SUBMIT_BTN: '[data-cy="payments-form-submit"]',
  },
});
```

> All selectors must use `[data-cy="..."]`. If the app doesn't have `data-cy` attributes, coordinate with the development team to add them before writing tests.

### 3. Route Entry

Add to `cypress/configs/app/routes.js`:

```js
const PAYMENTS = Object.freeze({
  ROOT: "/payments",
  DETAIL: (id) => `/payments/${id}`,
});

export const ROUTES = Object.freeze({
  // ...existing routes
  PAYMENTS,
});
```

### 4. Command File

Create `cypress/support/commands/modules/payments.commands.js` using the patterns in [support-commands-instructions.md](support-commands-instructions.md).

### 5. Register Commands

In `cypress/support/commands.js`, add:

```js
import "./commands/modules/payments.commands";
```

### 6. Schema (optional but recommended)

Create `cypress/schemas/payments.schema.js` for response shape validation.

### 7. Fixture Data

Create `cypress/fixtures/payments.json` with test data objects.

### 8. Spec Files

Create `cypress/tests/payments/smoke/payments-smoke.cy.js`.

---

## Updating an Existing Module

### Adding a new API endpoint

1. Add to the `custom` array in the API config:

   ```js
   custom: [
     {
       alias: "PAYMENT_VOID",
       method: "POST",
       pattern: "/api/v1/payments/**/void",
     },
   ];
   ```

2. Add a command in the module's command file that calls `cy.apiIntercept(CONFIG, 'PAYMENT_VOID')`.
3. Add the corresponding `[data-cy]` selector to the UI config if the action is UI-triggered.

### Changing a selector

1. Update the constant in the UI config file.
2. Run `npm run cy:run:smoke` to verify nothing regressed.
3. The change automatically propagates to all commands that import the constant.

---

## Dependency Updates

```bash
# Check for outdated packages
npm outdated

# Update Cypress minor version
npm install cypress@latest --save-dev

# Verify tests still pass after update
npm run cy:run:smoke
```

Cypress major version upgrades may require reviewing `cypress.config.js` for breaking changes in the config API.

---

## Debugging CI Failures

1. Check the video artifacts in `cypress/videos/` for visual playback.
2. Check JUnit XML in `reports/junit/` for structured failure data.
3. Run the specific failing spec locally:

   ```bash
   npx cypress run --spec "cypress/tests/payments/smoke/payments-smoke.cy.js"
   ```

4. Use the `@cypress/grep` tag to isolate one test:

   ```bash
   npx cypress run --env grepTags=@smoke,grep="loads the list"
   ```
