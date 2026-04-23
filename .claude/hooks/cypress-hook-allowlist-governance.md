# Hook Allowlist Governance

This file must be updated in the same commit as `cypress-hook-allowlist.json`.
Every allowlist entry requires a justification. Entries without justification will be removed at the next review.

## Format

```
selector|route|endpoint: <value>
Owner: <team or file>
Reason: <why this literal is acceptable>
Review date: <YYYY-MM-DD>
Removal condition: <when this can be removed>
```

---

## Current Allowlist Entries

### Selectors

**`body`**
Owner: framework core
Reason: `cy.get('body')` is used in framework-level checks for global page state (e.g., loading indicators, modal overlays). This is a structural element, not a feature selector.
Review date: 2026-07-01
Removal condition: Never — this is a permanent framework exception.

**`html`**
Owner: framework core
Reason: `cy.get('html')` is used in a11y and viewport assertions at the document root level.
Review date: 2026-07-01
Removal condition: Never — permanent framework exception.

### Routes

**`/`**
Owner: framework core
Reason: `cy.visit('/')` navigates to the application root before feature navigation. This is the standard entry point for all tests.
Review date: 2026-07-01
Removal condition: If base URL changes are all handled via config, this may be removed.

---

## Review Policy

- Review all entries every 6 months
- Any entry older than 12 months without a clear permanent justification is a candidate for removal
- Allowlist changes require a PR with this governance file updated in the same commit
