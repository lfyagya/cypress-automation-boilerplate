---
name: cypress-command-first-migration
description: "Use when migrating Cypress specs from legacy action files or page-object patterns to command-first architecture (Config → Commands → Tests). BLOCKING: Load this skill via readFile BEFORE generating any migration code."
---

# Cypress Command-First Migration Skill

## Objective

Migrate Cypress tests from legacy patterns (action classes, page objects, hardcoded selectors) to a clean command-first architecture.

## Detect Legacy Patterns

Before migrating, scan for these anti-patterns:

| Anti-Pattern               | Example                                      | Migration Target                               |
| -------------------------- | -------------------------------------------- | ---------------------------------------------- |
| Page object instantiation  | `const nav = new NavBarObj()`                | `cy.navigateToDashboard(...)`                  |
| Action file import         | `import { loginAction } from '*.actions.js'` | `cy.ensureAuthenticated()`                     |
| Hardcoded selector         | `cy.get('.btn-submit').click()`              | `cy.get(FEATURE_UI.SUBMIT_BUTTON).click()`     |
| Hardcoded URL in test      | `cy.visit('/specific/path')`                 | `cy.navigateToDashboard('Feature Name')`       |
| Raw `cy.intercept` in test | `cy.intercept('GET', '/api/...')`            | `cy.apiIntercept(FEATURE_API.ENTRY)`           |
| `cy.wait(ms)`              | `cy.wait(3000)`                              | `cy.apiWait(FEATURE_API.ENTRY)`                |
| Direct API login           | `cy.login(url, user, pass)`                  | `cy.ensureAuthenticated()` with `cy.session()` |

## Migration Sequence (Per File)

1. **Identify the module** — what feature/domain is this spec testing?
2. **Check for existing configs** — does `configs/api/` and `configs/ui/` already have entries?
   - If not: generate API config + UI config first (use `/create-api-config` and `/create-ui-config` prompts).
3. **Check for existing commands** — does `support/commands/` have a command file for this module?
   - If not: generate command file (use `/create-command` prompt).
4. **Migrate the spec**:
   - Remove action/page-object imports
   - Replace `cy.intercept(raw)` → `cy.apiInterceptAll(MODULE_API)`
   - Replace `cy.wait(ms)` → `cy.apiWait(MODULE_API.ENTRY)`
   - Replace hardcoded selectors → `MODULE_UI.KEY`
   - Replace `cy.login(...)` → `cy.ensureAuthenticated()`
   - Move any reusable interaction logic from the spec to a command file
5. **Verify** — `it.only` on each migrated test to confirm isolation.
6. **Remove legacy file** once migration is confirmed (do not leave dual ownership).

## Output Contract

1. List legacy patterns found (file + type).
2. Generate config/command files needed.
3. Produce migrated spec.
4. Note any legacy files to delete.
