---
description: Use when creating a new Cypress API config file with createModuleConfig, Object.freeze entries, aliases, and expectedStatus values.
agent: agent
model: Claude Sonnet 4.6
---

Generate a production-ready API config file.

## Inputs

- Module name (kebab-case): `${input:moduleName}` (e.g. `loan-applications`)
- Export constant (UPPER_SNAKE_CASE): `${input:exportConst}` (e.g. `LOAN_APPLICATIONS_API`)
- API base path: `${input:apiBasePath}` (e.g. `/api/loan-applications`)
- Alias prefix (2-4 chars): `${input:prefix}` (e.g. `loan`)
- Primary resource (kebab-case): `${input:resource}` (e.g. `applications`)
- CRUD operations needed: `${input:crudOps}` (e.g. `LIST, DETAILS, CREATE, UPDATE`)

## Output: `cypress/configs/api/modules/${input:moduleName}/${input:moduleName}.api.js`

```javascript
import { createModuleConfig } from '@core/api/api-config.factory.js';
import { HTTP_STATUS } from '@core/api/status-codes.js';

export const ${input:exportConst} = createModuleConfig({
  basePath: '${input:apiBasePath}',
  prefix: '${input:prefix}',
  resources: {
    '${input:resource}': [${input:crudOps}],
  },
  custom: {
    // Add non-CRUD endpoints here if needed
  },
});
```

## Rules

- Use `createModuleConfig` — never build entries by hand
- Use `HTTP_STATUS` constants — never raw numbers
- Prefix must be unique across all module configs (check existing files first)
- Export constant must be UPPER_SNAKE_CASE and unique
- File path: `cypress/configs/api/modules/{module-name}/{module-name}.api.js`
