---
applyTo: "cypress/support/commands/**/*.js"
---

# Command File Instructions

Command files are the primary reusable automation layer. They own all reusable interaction mechanics.

## Required Pattern

```javascript
/**
 * @fileoverview <Module> Commands
 * <Short description of what these commands do>
 */

import { FEATURE_UI } from "@configs/ui/modules/...";
import { FEATURE_API } from "@configs/api/...";

Cypress.Commands.add("<verb><FeatureContext>", (options = {}) => {
  // Use config constants, not literals
  cy.get(FEATURE_UI.SOME_ELEMENT).click();
});
```

## Rules

1. One command name has exactly one owner file.
2. Do not duplicate `Cypress.Commands.add('name', ...)` across files.
3. Use clear verb-oriented names: `openFilter`, `submitForm`, `assertTableRow`.
4. Consume selectors/API config from `@configs/**` only.
5. No `cy.wait(ms)` — use `cy.apiWait()` or `.should()` assertions.
6. Register the file in `cypress/support/commands.js`.

## Folder Placement

- `commands/common/` — framework-wide reusable commands
- `commands/modules/` — module-level command composition
- `commands/dashboards/` — dashboard-specific commands used directly by specs
