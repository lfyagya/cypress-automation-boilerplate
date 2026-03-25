---
applyTo: "cypress/tests/**/*.cy.js"
---

# Test File Instructions

Tests must be thin orchestration layers. All reusable behavior lives in command files.

## Required Pattern

```javascript
import { FEATURE_UI } from "@configs/ui/modules/...";
import { FEATURE_API } from "@configs/api/...";

describe(
  "Feature: <what is being tested>",
  { tags: ["@smoke", "@module-name"] },
  () => {
    before(() => {
      cy.ensureAuthenticated();
    });

    beforeEach(() => {
      cy.ensureAuthenticated();
      cy.navigateToDashboard("<Dashboard Name>");
    });

    it("<what should happen>", () => {
      cy.someCommand();
      cy.get(FEATURE_UI.ELEMENT).should("be.visible");
    });
  },
);
```

## Rules

- Never hardcode selectors — import from `@configs/ui/**`.
- Never hardcode API endpoints — import from `@configs/api/**`.
- Never use `cy.wait(ms)`.
- Auth in `before()` + `beforeEach()` via `cy.ensureAuthenticated()`.
- API intercepts set up before `cy.visit()` or navigation.
- Use `@cypress/grep` tags for suite filtering (`@smoke`, `@e2e`, `@module-name`).
