---
applyTo: "cypress/configs/**/*.js"
---

# Config File Instructions

Config files are pure constants. They have no logic, no Cypress commands, no side effects.

## API Config Pattern (`configs/api/**/*.api.js`)

```javascript
import { createModuleConfig } from "@core/api/api-config.factory.js";
import { HTTP_STATUS } from "@core/api/status-codes.js";

export const FEATURE_API = createModuleConfig({
  basePath: "/api/your-module",
  prefix: "feat",
  resources: {
    "resource-name": ["LIST", "DETAILS", "CREATE", "UPDATE", "DELETE"],
  },
  custom: {
    SPECIAL_ENDPOINT: {
      method: "POST",
      endpoint: "/api/your-module/special*",
      alias: "featPostSpecial",
      expectedStatus: HTTP_STATUS.OK,
    },
  },
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
