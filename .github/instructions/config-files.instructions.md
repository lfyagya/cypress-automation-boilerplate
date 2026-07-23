---
applyTo: "cypress/configs/**/*.js"
---

# Config File Instructions

Config files are pure constants. They have no logic, no Cypress commands, no side effects.

## API Config Pattern (`configs/api/**/*.api.js`)

```javascript
import { HTTP_STATUS } from "@core/api/status-codes.js";

export const FEATURE_API = Object.freeze({
  LIST: Object.freeze({
    method: "GET",
    endpoint: "**/api/feature**",
    alias: "featureList",
    expectedStatus: HTTP_STATUS.OK,
  }),
  CREATE: Object.freeze({
    method: "POST",
    endpoint: "**/api/feature**",
    alias: "featureCreate",
    expectedStatus: HTTP_STATUS.CREATED,
  }),
});
```

## UI Config Pattern (`configs/ui/**/*.ui.js`)

```javascript
export const FEATURE_UI = Object.freeze({
  CONTAINER: '[data-cy="feature-container"]',
  SUBMIT_BUTTON: '[data-cy="feature-submit"]',
  ERROR_MESSAGE: '[data-cy="feature-error"]',
  TABLE_ROW: '[data-cy="feature-table-row"]',
});
```

## Rules

- Use `Object.freeze()` on all exports.
- Use `data-cy` attributes as primary selectors.
- UPPER_SNAKE_CASE keys.
- No Cypress commands, no logic — constants only.
- Before adding a new selector/endpoint/route, grep the literal value across all of
  `cypress/configs/**` first — not just the module folder that seems relevant. The same value can
  already be defined under a different module or a different key name.
