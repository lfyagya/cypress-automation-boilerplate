# API Layer Guide

## How It Works

```text
createModuleConfig()        ← factory: builds intercept config from a route spec
     ↓
api.engine.js               ← pure functions: registerIntercept, waitForAPI, etc.
     ↓
api.commands.js             ← Cypress.Commands.add wrappers
     ↓
<module>.commands.js        ← calls cy.apiIntercept / cy.apiWait
     ↓
spec.cy.js                  ← calls module commands
```

## Creating an API Config

```js
// cypress/configs/api/modules/payments/payments.api.js
import { createModuleConfig } from "@core/api";

export const PAYMENTS_CONFIG = createModuleConfig({
  basePath: "/api/v1/payments",
  prefix: "PAYMENT",
  resources: ["LIST", "DETAILS", "CREATE", "UPDATE", "DELETE"],
  custom: [
    {
      alias: "PAYMENT_VOID",
      method: "POST",
      pattern: "/api/v1/payments/**/void",
    },
  ],
});
```

`createModuleConfig` generates the following alias→method→URL map automatically:

| Alias              | Method | URL Pattern                |
| ------------------ | ------ | -------------------------- |
| `@PAYMENT_LIST`    | GET    | `/api/v1/payments`         |
| `@PAYMENT_DETAILS` | GET    | `/api/v1/payments/**`      |
| `@PAYMENT_CREATE`  | POST   | `/api/v1/payments`         |
| `@PAYMENT_UPDATE`  | PUT    | `/api/v1/payments/**`      |
| `@PAYMENT_DELETE`  | DELETE | `/api/v1/payments/**`      |
| `@PAYMENT_VOID`    | POST   | `/api/v1/payments/**/void` |

## Available Commands

### `cy.apiIntercept(config, alias)`

Register a single intercept before visiting a page.

```js
cy.apiIntercept(PAYMENTS_CONFIG, "PAYMENT_LIST");
cy.visit("/payments");
cy.apiWait("@PAYMENT_LIST");
```

### `cy.apiInterceptAll(config, options?)`

Register all intercepts for a module at once.

```js
cy.apiInterceptAll(PAYMENTS_CONFIG);
// options: { only: ['PAYMENT_LIST'], except: ['PAYMENT_DELETE'] }
```

### `cy.apiWait(alias)`

Wait for a registered intercept to complete.

```js
cy.apiWait("@PAYMENT_LIST").then(({ response }) => {
  expect(response.statusCode).to.eq(200);
});
```

### `cy.apiWaitAll(aliases)`

Wait for multiple intercepts simultaneously.

```js
cy.apiWaitAll(["@PAYMENT_LIST", "@USER_PROFILE"]);
```

### `cy.apiRequest(options)`

Make a direct API call (for setup/teardown, not for testing UI flows).

```js
cy.apiRequest({
  method: "POST",
  url: "/api/v1/payments",
  body: { amount: 100 },
});
```

### `cy.apiStub(config, alias, response)`

Return a mocked response instead of hitting the real server.

```js
cy.apiStub(PAYMENTS_CONFIG, "PAYMENT_LIST", { body: { items: [], total: 0 } });
```

## Intercepting Before `cy.visit()`

**Critical rule:** Intercepts must be registered before the page visit that triggers the request.

```js
// ✅ Correct
beforeEach(() => {
  cy.apiIntercept(CONFIG, "EXAMPLE_LIST");
  cy.visit("/example");
  cy.apiWait("@EXAMPLE_LIST");
});

// ❌ Wrong — the request may fire before the intercept is registered
beforeEach(() => {
  cy.visit("/example");
  cy.apiIntercept(CONFIG, "EXAMPLE_LIST"); // too late
});
```

## Validating Response Shape

```js
import { EXAMPLE_SCHEMAS } from "@schemas/example.schema";

cy.apiWait("@EXAMPLE_LIST").then(({ response }) => {
  cy.validateSchema(response.body, EXAMPLE_SCHEMAS.LIST);
});
```
