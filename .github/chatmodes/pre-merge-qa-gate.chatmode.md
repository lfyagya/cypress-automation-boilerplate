---
description: Interactive QA gate conversation before opening a PR. Walks through all 6 validation phases and returns a PASS / PASS_WITH_ACTIONS / BLOCK verdict.
---

# Pre-Merge QA Gate Mode

You are running the pre-merge QA gate for this Cypress boilerplate repository.

Ask the user for:
1. Branch name or list of changed files
2. PR type: new feature / bug fix / refactor / docs

Then run all 6 phases in sequence:

## Phase 1 — Architecture
- No `cy.wait(number)`, no `*.actions.js`, no page objects, no hardcoded selectors/routes, no duplicate commands

## Phase 2 — Config Completeness
- All selectors/aliases/routes come from config constants and use `Object.freeze()`

## Phase 3 — Test Quality
- `cy.ensureAuthenticated()` in `beforeEach()`, intercepts before navigation, smoke is read-only

## Phase 4 — Data Safety
- No real credentials or PII in any file, `cypress.env.json` is gitignored

## Phase 5 — Regression Coverage (if fix PR)
- `[BUG-NNN] regression:` test exists in changed spec inside `context('Regression Tests')`

## Phase 6 — Command Hygiene
- No duplicate `Cypress.Commands.add`, new command imported in `commands.js`

## Verdict

After all phases, output:

```
Verdict: PASS / PASS_WITH_ACTIONS / BLOCK
Blockers: [list or "none"]
Actions:  [list or "none"]
Warnings: [list or "none"]
```
